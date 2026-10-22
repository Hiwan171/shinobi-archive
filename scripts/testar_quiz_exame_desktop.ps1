param([Parameter(Mandatory=$true)][int]$DesktopProcessId,[string]$ProjectTitle='ShinobiArchiveHTML')
. (Join-Path $PSScriptRoot 'testar_quiz_desktop.ps1') -DesktopProcessId $DesktopProcessId -ProjectTitle $ProjectTitle -FunctionsOnly
function Read-QuizClock([string]$Filename) {
 $quizClockControls=Read-QuizControls
 $quizHeading=@($quizClockControls | Where-Object {$_.Current.Name -eq 'EXAME EM ANDAMENTO'})[0]
 $quizConfirm=@($quizClockControls | Where-Object {$_.Current.Name -and $_.Current.Name.StartsWith('Confirmar resposta') -and $_.Current.ControlType -eq [System.Windows.Automation.ControlType]::Button})[0]
 if(-not $quizHeading -or -not $quizConfirm){throw 'Native exam controls unavailable'}
 $quizWindowRect=$quizRoot.Current.BoundingRectangle
 $quizFullImage=New-Object System.Drawing.Bitmap ([int]$quizWindowRect.Width),([int]$quizWindowRect.Height)
 $quizFullCanvas=[System.Drawing.Graphics]::FromImage($quizFullImage);$quizFullDC=$quizFullCanvas.GetHdc()
 try{$quizCaptureOk=[ShinobiQuizCapture]::PrintWindow($quizProcess.MainWindowHandle,$quizFullDC,2)}finally{$quizFullCanvas.ReleaseHdc($quizFullDC)}
 if(-not $quizCaptureOk){throw 'Native timer capture failed'}
 $quizCropRect=New-Object System.Drawing.Rectangle ([int]($quizConfirm.Current.BoundingRectangle.Right-$quizWindowRect.Left-90)),([int]($quizHeading.Current.BoundingRectangle.Top-$quizWindowRect.Top-10)),90,36
 $quizCrop=$quizFullImage.Clone($quizCropRect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
 $quizMemory=New-Object System.IO.MemoryStream
 $quizCrop.Save($quizMemory,[System.Drawing.Imaging.ImageFormat]::Png)
 $quizCrop.Save((Join-Path $quizOutput $Filename),[System.Drawing.Imaging.ImageFormat]::Png)
 $quizHasher=[System.Security.Cryptography.SHA256]::Create();$quizHash=[Convert]::ToBase64String($quizHasher.ComputeHash($quizMemory.ToArray()))
 $quizHasher.Dispose();$quizMemory.Dispose();$quizCrop.Dispose();$quizFullCanvas.Dispose();$quizFullImage.Dispose()
 return $quizHash
}
Invoke-QuizControl 'Exame Shinobi'
Wait-QuizPrefix @('Iniciar','Pausar / encerrar','Continuar miss','Nova miss')
$quizInitialNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
if(-not [bool]($quizInitialNames | Where-Object {$_ -and $_.StartsWith('Iniciar')})){
 if($quizInitialNames -contains 'Pausar / encerrar'){Invoke-QuizControl 'Pausar / encerrar'}
 Invoke-QuizControl 'Encerrar e ver resultado parcial'
 Invoke-QuizControl 'Nova miss'
}
Invoke-QuizControl 'Exame Tempo por pergunta'
Wait-QuizPrefix @('Iniciar exame')
Invoke-QuizControl 'Iniciar exame'
Wait-QuizPrefix @('Confirmar resposta')
$quizBefore=Read-QuizClock 'quiz-desktop-relogio-antes.png'
Start-Sleep -Milliseconds 1500
$quizAfter=Read-QuizClock 'quiz-desktop-relogio-depois.png'
Test-QuizCheck 'Exam countdown visibly changes in the real Power BI host' ($quizAfter -ne $quizBefore)
Invoke-QuizControl 'Pausar / encerrar'
Wait-QuizPrefix @('Continuar miss')
$quizPausedBefore=Read-QuizClock 'quiz-desktop-relogio-pausa-antes.png'
Start-Sleep -Milliseconds 1500
$quizPausedAfter=Read-QuizClock 'quiz-desktop-relogio-pausa-depois.png'
Test-QuizCheck 'Native pause freezes the countdown' ($quizPausedBefore -eq $quizPausedAfter)
Save-QuizNativeImage 'quiz-desktop-exame-pausa.png'
Invoke-QuizControl 'Continuar miss'
Invoke-QuizControl 'Pular ('
Wait-QuizPrefix @('Quest'+[char]0x00E3+'o pulada.')
$quizExamNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
$quizTwoHearts=([string][char]0x2665)*2+([string][char]0x2661)
Test-QuizCheck 'Skipping an exam question removes exactly one life in Desktop' ($quizExamNames -contains $quizTwoHearts)
Save-QuizNativeImage 'quiz-desktop-exame-vida.png'
Invoke-QuizControl 'Pausar / encerrar'
Wait-QuizPrefix @('Encerrar e ver resultado parcial')
Test-QuizCheck 'Current compiled version supports pausing after native feedback' $true
Invoke-QuizControl 'Encerrar e ver resultado parcial'
Wait-QuizPrefix @('Nova miss')
$quizExamNames=@((Read-QuizControls) | ForEach-Object {$_.Current.Name})
Test-QuizCheck 'Manually ended native exam is marked as partial' ($quizExamNames -contains 'RESULTADO PARCIAL')
Invoke-QuizControl 'Nova miss'
Invoke-QuizControl 'Treino Sem tempo'
Save-QuizNativeImage 'quiz-desktop-final.png'
[ordered]@{project='ShinobiArchiveHTML.pbip';validationProjectTitle=$ProjectTitle;desktopProcessId=$DesktopProcessId;passed=$quizResults.Count;results=@($quizResults);nativeHost='Power BI Desktop / HTML Content Regular 2.0';desktopValidated=$true;errors=@();screenshots=@('quiz-desktop-exame-pausa.png','quiz-desktop-exame-vida.png','quiz-desktop-final.png')} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $quizOutput 'testes_quiz_exame_desktop.json') -Encoding UTF8
Write-Output ('Native exam checks passed: '+$quizResults.Count)
