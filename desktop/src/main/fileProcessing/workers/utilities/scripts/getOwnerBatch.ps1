[string[]]$FilePaths = $args

foreach ($FilePath in $FilePaths) {
  try {
    $owner = (Get-ACL -Path $FilePath).Owner
    Write-Host "OK|$FilePath|$owner"
  } catch {
    Write-Host "ERROR|$FilePath|Not Available"
  }
}
