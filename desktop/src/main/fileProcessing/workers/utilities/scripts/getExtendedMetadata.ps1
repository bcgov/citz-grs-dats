param (
    [string]$FilePath
)

if (-Not (Test-Path -Path $FilePath -PathType Leaf)) {
    Write-Output "File does not exist."
    exit 1
}

function Get-FileMetadata {
    param (
        [string]$Path
    )

    try {
        $file = Get-Item -Path $Path | Select-Object *
    } catch {
        Write-Error $_
        exit 1
    }

    # Extract metadata using Select-Object *
    foreach ($property in $file.PSObject.Properties) {
        if ($property.Value -ne $null) {
            Write-Host "$($property.Name) = $($property.Value)"
        }
    }
}

function Get-ExtendedFileMetadata {
    param (
        [string]$Path
    )

    $shell = New-Object -ComObject Shell.Application
    $folder = $shell.Namespace((Get-Item $Path).DirectoryName)
    $file = $folder.ParseName((Get-Item $Path).Name)

    $propertyIndex = 0

    while ($true) {
        $propertyName = $folder.GetDetailsOf($folder.Items, $propertyIndex)
        $propertyValue = $folder.GetDetailsOf($file, $propertyIndex)

        if (-not $propertyName) {
            break  # Stop if no more properties exist
        }

        if ($propertyValue) {
            Write-Host "$propertyName = $propertyValue"
        } else {
            Write-Host "$propertyName = ~"
        }

        $propertyIndex++
    }
}

function Get-AlternateDataStreams {
    param (
        [string]$Path
    )
    $streams = Get-Item -Path $Path -Stream * | Select-Object Stream, Length
    foreach ($stream in $streams) {
        Write-Host "Stream: $($stream.Stream) - Size: $($stream.Length) bytes"
    }
    return $streams
}

function Get-FileHashMetadata {
    param (
        [string]$Path
    )
    $hashTypes = @("MD5", "SHA1", "SHA256", "SHA512")

    foreach ($hashType in $hashTypes) {
        $hash = Get-FileHash -Path $Path -Algorithm $hashType
        Write-Host "$hashType = $($hash.Hash)"
    }
}

function Get-NTFSAttributes {
    param (
        [string]$Path
    )
    $fsutilOutput = fsutil file queryExtents $Path 2>$null
    if ($fsutilOutput) {
        Write-Host "Extents: $fsutilOutput"
    }
}

function Get-DigitalSignature {
    param (
        [string]$Path
    )
    try {
        $signature = Get-AuthenticodeSignature -FilePath $Path
        if ($signature -and $signature.SignerCertificate) {
            Write-Host "Certificate Subject = $($signature.SignerCertificate.Subject)"
            Write-Host "Certificate Issuer = $($signature.SignerCertificate.Issuer)"
            Write-Host "Signature Status = $($signature.Status)"
            return @{
                Subject = $signature.SignerCertificate.Subject
                Issuer = $signature.SignerCertificate.Issuer
                Status = $signature.Status
            }
        } else {
            Write-Host "No digital signature found."
            return $null
        }
    } catch {
        Write-Host "Error retrieving digital signature: $_"
        return $null
    }
}

# Retrieve all metadata
$fileMetadata = Get-FileMetadata -Path $FilePath
$extendedMetadata = Get-ExtendedFileMetadata -Path $FilePath
$adsMetadata = Get-AlternateDataStreams -Path $FilePath
$fileHashes = Get-FileHashMetadata -Path $FilePath
$ntfsAttributes = Get-NTFSAttributes -Path $FilePath
$signatureInfo = Get-DigitalSignature -Path $FilePath
