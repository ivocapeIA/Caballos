$ErrorActionPreference = "Continue"
$src = "C:\Users\IvoCapezzuto\Downloads\Equit-20260924T172401Z-1-001\Equit"
$dst = "C:\Users\IvoCapezzuto\Codigos\Caballos\media\videos"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$named = [ordered]@{
  "10 - CHAS COMANCHE" = @{ id = "chas-20230625-sv110"; caption = "CHAS · 25 jun 2023 · SV 1,10" }
  "24 - LV CHAS"       = @{ id = "chas-20230720-sv110"; caption = "CHAS · 20 jul 2023 · SV 1,10" }
  "25 - LV CHAS"       = @{ id = "chas-20230720-sv100"; caption = "CHAS · 20 jul 2023 · SV 1,00" }
  "8 - CON PREMIACION" = @{ id = "chas-20230826-premio"; caption = "CHAS · 26 ago 2023 · premiación" }
  "A - LV CHAS"        = @{ id = "chas-20230826-sv110"; caption = "CHAS · 26 ago 2023 · SV 1,10" }
}

$videos = Get-ChildItem $src | Where-Object { $_.Extension -match '\.(mp4|mov)$' }
$n = 0
foreach ($v in $videos) {
  $n++
  $id = $null
  foreach ($key in $named.Keys) {
    if ($v.Name.StartsWith($key)) { $id = $named[$key].id; break }
  }
  if (-not $id) {
    $id = ($v.BaseName -replace '[^A-Za-z0-9]+','-').Trim('-').ToLower()
    if ($id.Length -gt 40) { $id = $id.Substring(0, 40).Trim('-') }
  }
  $out = Join-Path $dst "$id.mp4"
  $poster = Join-Path $dst "$id.jpg"
  if ((Test-Path $out) -and (Get-Item $out).Length -gt 50000) {
    Write-Host "[$n/$($videos.Count)] skip $id"
  } else {
    Write-Host "[$n/$($videos.Count)] encode $id"
    & ffmpeg -y -i $v.FullName -vf "scale=-2:720" -c:v libx264 -preset veryfast -crf 27 -c:a aac -b:a 96k -movflags +faststart $out
  }
  if (-not (Test-Path $poster) -and (Test-Path $out)) {
    & ffmpeg -y -i $out -vf "thumbnail,scale=640:-2" -frames:v 1 $poster
  }
}
Write-Host "DONE"
Get-ChildItem $dst | Format-Table Name, Length
