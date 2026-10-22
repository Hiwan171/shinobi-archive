param([int]$DesktopProcessId=14896,[string]$ProjectTitle='ShinobiQuizValidacao')
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'testar_quiz_desktop.ps1') -DesktopProcessId $DesktopProcessId -ProjectTitle $ProjectTitle -FunctionsOnly
$quizOutput=Join-Path $quizWorkspace 'powerbi/auditoria-visual'
New-Item -ItemType Directory -Path $quizOutput -Force | Out-Null
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class AuditPointer {
 [StructLayout(LayoutKind.Sequential)] public struct Point {public int X;public int Y;}
 [DllImport("user32.dll")] public static extern bool GetCursorPos(out Point point);
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
}
'@
$auditPointer=New-Object AuditPointer+Point
[AuditPointer]::GetCursorPos([ref]$auditPointer) | Out-Null
$auditRect=$quizRoot.Current.BoundingRectangle
[AuditPointer]::SetCursorPos([int]($auditRect.Left+12),[int]($auditRect.Bottom-12)) | Out-Null
[AuditPointer]::SetForegroundWindow($quizProcess.MainWindowHandle) | Out-Null
if([AuditPointer]::GetForegroundWindow() -eq $quizProcess.MainWindowHandle){[System.Windows.Forms.SendKeys]::SendWait('{ESC}')}
Start-Sleep -Milliseconds 1200
$auditNative=New-Object System.Collections.Generic.List[object]
function Invoke-AuditControl([string]$Name){
 $auditControls=Read-QuizControls
 $auditOrdered=@($auditControls | Where-Object {$_.Current.Name -eq $Name})+@($auditControls | Where-Object {$_.Current.Name -and $_.Current.Name -ne $Name -and $_.Current.Name.StartsWith($Name)})
 foreach($item in $auditOrdered){
  if($item.Current.Name -and $item.Current.Name.StartsWith($Name) -and $item.Current.IsEnabled -and -not $item.Current.IsOffscreen){
   $pattern=$null
   if($item.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern,[ref]$pattern)){$pattern.Invoke();Start-Sleep -Milliseconds 650;return}
   if($item.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern,[ref]$pattern)){$pattern.Select();Start-Sleep -Milliseconds 650;return}
   if($item.TryGetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern,[ref]$pattern)){$pattern.Toggle();Start-Sleep -Milliseconds 650;return}
  }
 }
 throw ('Native control unavailable: '+$Name)
}
function Save-Audit([string]$Name){
 Save-QuizNativeImage ($Name+'.png')
 $rows=@(foreach($item in (Read-QuizControls)){
  $r=$item.Current.BoundingRectangle
  if($item.Current.Name -and $r.Width -gt 0 -and $r.Height -gt 0){[pscustomobject]@{name=$item.Current.Name;type=$item.Current.ControlType.ProgrammaticName;x=$r.X;y=$r.Y;width=$r.Width;height=$r.Height}}
 })
 $auditNative.Add([pscustomobject]@{name=$Name;controls=$rows})
 Write-Output ('Captured '+$Name)
}
$tabs=@(
 @('arquivo','Arquivo Ninja'),@('grupos','Mundo Shinobi'),@('comparador','Frente a Frente'),@('popularidade','Popularidade'),@('episodios','Episódios'),@('quiz','Exame Shinobi')
)
foreach($tab in $tabs){Invoke-AuditControl $tab[1];Save-Audit ('powerbi-'+$tab[0])}
Invoke-AuditControl 'Arquivo Ninja'
Invoke-AuditControl 'História';Save-Audit 'powerbi-arquivo-historia'
Invoke-AuditControl 'Vínculos';Save-Audit 'powerbi-arquivo-vinculos'
Invoke-AuditControl 'Perfil'
Invoke-AuditControl 'Mundo Shinobi'
Invoke-AuditControl 'Equipes';Save-Audit 'powerbi-grupos-equipes'
Invoke-AuditControl 'Shinobi';Save-Audit 'powerbi-grupos-shinobi'
Invoke-AuditControl 'Clãs'
Invoke-AuditControl 'Frente a Frente'
foreach($label in @('Mapa de respostas','Arsenal cruzado','Linhagens & laços')){Invoke-AuditControl $label;Save-Audit ('powerbi-comparador-'+@{'Mapa de respostas'='matrix';'Arsenal cruzado'='arsenal';'Linhagens & laços'='links'}[$label])}
Invoke-AuditControl 'Leitura tática'
Invoke-AuditControl 'Popularidade'
Invoke-AuditControl 'Comparar fãs';Save-Audit 'powerbi-popularidade-comparacao'
Invoke-AuditControl 'Panorama';Save-Audit 'powerbi-popularidade-panorama'
Invoke-AuditControl 'Por região'
Invoke-AuditControl 'Exame Shinobi'
Invoke-AuditControl 'Iniciar treino';Save-Audit 'powerbi-quiz-jogo'
$questionNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
$question=@($quizBank.questions | Where-Object {$questionNames -contains $_.question})[0]
$correct=$question.options[$question.answer]
foreach($item in (Read-QuizControls)){
 if($item.Current.Name -match '^[ABCD] ' -and $item.Current.Name.Substring(2) -eq $correct){Invoke-AuditControl $item.Current.Name;break}
}
Invoke-AuditControl 'Confirmar resposta';Save-Audit 'powerbi-quiz-feedback'
Invoke-AuditControl 'Pausar / encerrar';Save-Audit 'powerbi-quiz-pausa'
Invoke-AuditControl 'Encerrar e ver resultado parcial';Save-Audit 'powerbi-quiz-parcial'
Invoke-AuditControl 'Nova missão'
Invoke-AuditControl 'Arquivo Ninja'
$proof=[ordered]@{capturedAt=[DateTime]::UtcNow.ToString('o');desktopProcessId=$DesktopProcessId;project=$ProjectTitle;version=$quizProcess.FileVersion;method='UI Automation + PrintWindow da janela selecionada';shots=$auditNative.ToArray();interfaceModified=$false}
$proof | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $quizOutput 'medicoes-powerbi.json') -Encoding UTF8
Write-Output ('Native audit captures: '+$auditNative.Count)
[AuditPointer]::SetCursorPos($auditPointer.X,$auditPointer.Y) | Out-Null
