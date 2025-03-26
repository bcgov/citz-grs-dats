[string[]]$FilePaths = $args

function Get-ExtendedFileMetadata {
  param (
    [string]$Path
  )

  # Start with Filepath at the top
  $metadata = @{ FilePath = $Path }

  try {
    $file = Get-Item -Path $Path -ErrorAction Stop
    $metadata.FileSize = $file.Length
    $metadata.CreationTime = $file.CreationTimeUtc
    $metadata.LastWriteTime = $file.LastWriteTimeUtc
    $metadata.LastAccessTime = $file.LastAccessTimeUtc

    # Alternate Data Streams
    try {
      $streams = Get-Item -Path $Path -Stream * | Select-Object Stream, Length
      $metadata.AlternateDataStreams = $streams | ForEach-Object {
        @{ Stream = $_.Stream; Length = $_.Length }
      }
    } catch {
      $metadata.AlternateDataStreams = @()
    }

    # File Hashes grouped
    $hashTypes = @("MD5", "SHA1", "SHA256", "SHA512")
    $checksums = @{}
    foreach ($hashType in $hashTypes) {
      try {
        $hash = Get-FileHash -Path $Path -Algorithm $hashType
        $checksums[$hashType] = $hash.Hash
      } catch {
        $checksums[$hashType] = "Error"
      }
    }
    $metadata.Checksums = $checksums

    # Digital Signature
    try {
      $signature = Get-AuthenticodeSignature -FilePath $Path
      if ($signature -and $signature.SignerCertificate) {
        $metadata.Signature = @{
          Subject = $signature.SignerCertificate.Subject
          Issuer = $signature.SignerCertificate.Issuer
          Status = $signature.Status
        }
      } else {
        $metadata.Signature = "Unsigned"
      }
    } catch {
      $metadata.Signature = "Error"
    }

    # NTFS Extents
    try {
      $extents = fsutil file queryExtents $Path 2>$null
      $metadata.NTFS_Attributes = $extents
    } catch {
      $metadata.NTFS_Attributes = "Unavailable"
    }

    # Extended Shell Metadata
    try {
      $shell = New-Object -ComObject Shell.Application
      $folder = $shell.Namespace((Get-Item $Path).DirectoryName)
      $parsedFile = $folder.ParseName((Get-Item $Path).Name)

      $propertyIndex = 0
      $maxProperties = 512
      $shellProps = @{}

      do {
        $propertyName = $folder.GetDetailsOf($folder.Items, $propertyIndex)
        $propertyValue = $folder.GetDetailsOf($parsedFile, $propertyIndex)

        if ($propertyName.Trim()) {
          $shellProps[$propertyName] = $propertyValue
        }

        $propertyIndex++
      } while ($propertyName -and $propertyName.Trim() -ne '' -and $propertyIndex -lt $maxProperties)

      $metadata.ShellProperties = $shellProps
    } catch {
      $metadata.ShellProperties = @{}
    }

    return $metadata
  } catch {
    throw $_
  }
}

# Batch execution
foreach ($FilePath in $FilePaths) {
  if (-Not (Test-Path -Path $FilePath -PathType Leaf)) {
    $errorObj = @{ Filepath = $FilePath; error = "File does not exist." }
    Write-Host "ERROR|$FilePath|$(ConvertTo-Json $errorObj -Compress)"
    continue
  }

  try {
    $result = Get-ExtendedFileMetadata -Path $FilePath
    $json = ConvertTo-Json $result -Compress
    Write-Host "OK|$FilePath|$json"
  } catch {
    $errorObj = @{ Filepath = $FilePath; error = $_.Exception.Message }
    Write-Host "ERROR|$FilePath|$(ConvertTo-Json $errorObj -Compress)"
  }
}
