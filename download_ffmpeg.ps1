$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$outputPath = "ffmpeg-release-essentials.zip"
$extractPath = "ffmpeg"

# Download ffmpeg zip file
Invoke-WebRequest -Uri $ffmpegUrl -OutFile $outputPath

# Extract the zip file
Expand-Archive -Path $outputPath -DestinationPath $extractPath

# Add ffmpeg to PATH (temporary for current session)
$env:Path += ";$(Join-Path -Path (Get-Location) -ChildPath "$extractPath\ffmpeg-*-essentials_build\bin")"

Write-Output "FFmpeg has been downloaded and added to the PATH."
