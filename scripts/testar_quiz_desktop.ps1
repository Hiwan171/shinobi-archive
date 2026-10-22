param([Parameter(Mandatory=$true)][int]$DesktopProcessId,[string]$ProjectTitle='ShinobiArchiveHTML',[switch]$FunctionsOnly)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class ShinobiQuizCapture { [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd,IntPtr hdc,uint flags); }
'@
$quizWorkspace=Split-Path -Parent $PSScriptRoot
$quizOutput=Join-Path $quizWorkspace 'powerbi/build/html'
$quizBank=Get-Content -LiteralPath (Join-Path $quizWorkspace 'data/editorial/quiz_shinobi.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$quizProcess=Get-Process -Id $DesktopProcessId
if($quizProcess.ProcessName -ne 'PBIDesktop' -or $quizProcess.MainWindowTitle -ne $ProjectTitle){throw 'This test only controls the ShinobiArchiveHTML Power BI Desktop window.'}
$quizRoot=[System.Windows.Automation.AutomationElement]::FromHandle($quizProcess.MainWindowHandle)
$quizResults=New-Object System.Collections.Generic.List[string]
function Read-QuizControls {
 $quizRoot.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)
}
function Test-QuizCheck([string]$Label,[bool]$Pass){if(-not $Pass){throw $Label};$quizResults.Add($Label);Write-Output ('PASS '+$Label)}
function Wait-QuizPrefix([string[]]$Prefixes){
 $quizUntil=[DateTime]::UtcNow.AddSeconds(20)
 do{
  $quizWaitNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
  foreach($quizWaitPrefix in $Prefixes){if([bool]($quizWaitNames | Where-Object {$_ -and $_.StartsWith($quizWaitPrefix)})){return}}
  Start-Sleep -Milliseconds 250
 }while([DateTime]::UtcNow -lt $quizUntil)
 throw 'Timed out waiting for the native quiz to render'
}
function Invoke-QuizControl([string]$Prefix){
 foreach($quizItem in (Read-QuizControls)){
  if($quizItem.Current.Name -and $quizItem.Current.Name.StartsWith($Prefix) -and $quizItem.Current.IsEnabled -and -not $quizItem.Current.IsOffscreen -and $quizItem.Current.ControlType -eq [System.Windows.Automation.ControlType]::Button){
   $quizInvoke=$null
   if($quizItem.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern,[ref]$quizInvoke)){$quizInvoke.Invoke();Start-Sleep -Milliseconds 200;return}
   if($quizItem.TryGetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern,[ref]$quizInvoke)){$quizInvoke.Toggle();Start-Sleep -Milliseconds 200;return}
  }
 }
 throw ('Quiz control unavailable: '+$Prefix)
}
function Save-QuizNativeImage([string]$Filename){
 $quizBounds=$quizRoot.Current.BoundingRectangle
 $quizImage=New-Object System.Drawing.Bitmap ([int]$quizBounds.Width),([int]$quizBounds.Height)
 $quizCanvas=[System.Drawing.Graphics]::FromImage($quizImage);$quizHdc=$quizCanvas.GetHdc()
 try{$quizOk=[ShinobiQuizCapture]::PrintWindow($quizProcess.MainWindowHandle,$quizHdc,2)}finally{$quizCanvas.ReleaseHdc($quizHdc)}
 if(-not $quizOk){throw 'Native target-window capture failed'}
 $quizImage.Save((Join-Path $quizOutput $Filename),[System.Drawing.Imaging.ImageFormat]::Png)
 $quizCanvas.Dispose();$quizImage.Dispose()
}
if($FunctionsOnly){return}
Invoke-QuizControl 'Exame Shinobi'
Wait-QuizPrefix @('Iniciar treino','Confirmar resposta','Voltar ao resultado','Nova miss','Continuar miss')
$quizNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
if(-not [bool]($quizNames | Where-Object {$_ -and $_.StartsWith('Iniciar treino')})){
 if([bool]($quizNames | Where-Object {$_ -and $_.StartsWith('Voltar ao resultado')})){Invoke-QuizControl 'Voltar ao resultado'}
 elseif([bool]($quizNames | Where-Object {$_ -and $_.StartsWith('Confirmar resposta')})){
  Invoke-QuizControl 'Pausar / encerrar'
  Invoke-QuizControl 'Encerrar e ver resultado parcial'
 }
 Invoke-QuizControl 'Nova miss'
 $quizNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
}
Test-QuizCheck 'Quiz configuration renders inside Power BI HTML Content' ([bool]($quizNames | Where-Object {$_ -and $_.StartsWith('Iniciar treino')}))
Test-QuizCheck 'Spoiler-free pool is 39 questions in Desktop' ($quizNames -contains '39 perguntas disponíveis')
Save-QuizNativeImage 'quiz-desktop-configuracao.png'
Invoke-QuizControl 'Iniciar treino'
$quizExpectedScore=0;$quizRound=0;$quizSeen=New-Object 'System.Collections.Generic.HashSet[string]'
while($quizRound -lt 15){
 Wait-QuizPrefix @('Confirmar resposta')
 $quizControls=Read-QuizControls
 $quizNames=@($quizControls | ForEach-Object {$_.Current.Name})
 $quizQuestion=@($quizBank.questions | Where-Object {$quizNames -contains $_.question})
 if($quizQuestion.Count -ne 1){throw 'Expected exactly one current quiz question in the native visual'}
 $quizQuestion=$quizQuestion[0]
 Test-QuizCheck ('Unique native question '+$quizQuestion.id) ($quizSeen.Add($quizQuestion.id))
 $quizCorrect=$quizQuestion.options[$quizQuestion.answer]
 $quizAnswerButton=@($quizControls | Where-Object {$_.Current.ControlType -eq [System.Windows.Automation.ControlType]::Button -and $_.Current.Name -match '^[ABCD] ' -and $_.Current.Name.Substring(2) -eq $quizCorrect})
 if($quizAnswerButton.Count -ne 1){throw 'Correct alternative not available in the native visual'}
 $quizChoicePattern=$null
 if($quizAnswerButton[0].TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern,[ref]$quizChoicePattern)){$quizChoicePattern.Invoke()}
 elseif($quizAnswerButton[0].TryGetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern,[ref]$quizChoicePattern)){$quizChoicePattern.Toggle()}
 else{throw 'Correct answer has no supported click or toggle pattern'}
 Invoke-QuizControl 'Confirmar resposta'
 Wait-QuizPrefix @('Resposta certa!')
 $quizRound++
 $quizBase=@{genin=100;chunin=150;jonin=200}[$quizQuestion.difficulty]
 $quizExpectedScore+=$quizBase+[Math]::Min(($quizRound-1)*25,100)
 $quizNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
 Test-QuizCheck ('Native feedback and scoring for '+$quizQuestion.id) (($quizNames -contains 'Resposta certa!') -and ($quizNames -contains $quizExpectedScore.ToString('N0',[System.Globalization.CultureInfo]::GetCultureInfo('pt-BR'))))
 if($quizRound -eq 1){Save-QuizNativeImage 'quiz-desktop-feedback.png'}
 if([bool]($quizNames | Where-Object {$_ -and $_.StartsWith('Ver resultado')})){Invoke-QuizControl 'Ver resultado';break}
 Invoke-QuizControl ('Pr'+[char]0x00F3+'xima quest')
}
$quizNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
Test-QuizCheck 'Full mission reaches results inside Desktop' ($quizNames -contains 'Conhecimento de mestre.')
Test-QuizCheck 'Native result preserves exact cumulative points' ($quizNames -contains $quizExpectedScore.ToString('N0',[System.Globalization.CultureInfo]::GetCultureInfo('pt-BR')))
Test-QuizCheck 'Perfect mission is 100 percent accurate' ($quizNames -contains '100%')
Save-QuizNativeImage 'quiz-desktop-resultado.png'
Invoke-QuizControl 'Revisar respostas'
$quizNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
Test-QuizCheck 'Answer review and explanation render inside Desktop' (($quizNames -contains 'Resposta correta') -and [bool]($quizNames | Where-Object {$_ -and $_.StartsWith('Consultar refer')}))
Save-QuizNativeImage 'quiz-desktop-revisao.png'
Invoke-QuizControl 'Voltar ao resultado'
Invoke-QuizControl 'Nova miss'
Save-QuizNativeImage 'quiz-desktop-final.png'
$quizProof=[ordered]@{project='ShinobiArchiveHTML.pbip';desktopVersion=$quizProcess.FileVersion;desktopProcessId=$DesktopProcessId;nativeHost='Power BI Desktop / HTML Content Regular 2.0';passed=$quizResults.Count;results=@($quizResults);nativeQuestionsAnswered=$quizRound;nativeExpectedScore=$quizExpectedScore;nativeScreenshots=@('quiz-desktop-configuracao.png','quiz-desktop-feedback.png','quiz-desktop-resultado.png','quiz-desktop-revisao.png','quiz-desktop-final.png');desktopValidated=$true;errors=@();note='UI Automation against the selected project window; PrintWindow captures only that Power BI window. Browser checks are reported separately.'}
$quizProof | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $quizOutput 'testes_quiz_desktop.json') -Encoding UTF8
Write-Output ('Native Power BI checks passed: '+$quizResults.Count)
