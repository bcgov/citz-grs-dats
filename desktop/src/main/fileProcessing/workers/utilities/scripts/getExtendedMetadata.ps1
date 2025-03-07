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

    $metadata = @{}

    # Extract metadata using Select-Object *
    foreach ($property in $file.PSObject.Properties) {
        if ($property.Value -ne $null) {
            Write-Host "$($property.Name) = $($property.Value)"
            $metadata[$property.Name] = $property.Value
        }
    }

    return $metadata
}

function Get-ExtendedFileMetadata {
    param (
        [string]$Path
    )

    $shell = New-Object -ComObject Shell.Application
    $folder = $shell.Namespace((Get-Item $Path).DirectoryName)
    $file = $folder.ParseName((Get-Item $Path).Name)

    $extendedMetadata = @{}

    for ($i = 0; $i -lt 300; $i++) {  # Some properties may be empty
        $propertyName = $folder.GetDetailsOf($folder.Items, $i)
        $propertyValue = $folder.GetDetailsOf($file, $i)

        if ($propertyName -and $propertyValue) {
            Write-Host "$propertyName = $propertyValue"
            $extendedMetadata[$propertyName] = $propertyValue
        }
    }

    return $extendedMetadata
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
    $hashes = @{}
    $hashTypes = @("MD5", "SHA1", "SHA256", "SHA512")

    foreach ($hashType in $hashTypes) {
        $hash = Get-FileHash -Path $Path -Algorithm $hashType
        Write-Host "$hashType = $($hash.Hash)"
        $hashes[$hashType] = $hash.Hash
    }
    return $hashes
}

function Get-NTFSAttributes {
    param (
        [string]$Path
    )
    $attributes = @{}
    $fsutilOutput = fsutil file queryExtents $Path 2>$null
    if ($fsutilOutput) {
        Write-Host "Extents: $fsutilOutput"
        $attributes["Extents"] = $fsutilOutput
    }
    return $attributes
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

function Get-AllShellProperties {
    param (
        [string]$Path
    )
    $shell = New-Object -ComObject Shell.Application
    $folder = $shell.Namespace((Get-Item $Path).DirectoryName)
    $file = $folder.ParseName((Get-Item $Path).Name)

    $shellMetadata = @{}
    for ($i = 0; $i -lt 500; $i++) {  # Some properties may be empty
        $propertyName = $folder.GetDetailsOf($folder.Items, $i)
        $propertyValue = $folder.GetDetailsOf($file, $i)

        if ($propertyName -and $propertyValue) {
            Write-Host "$propertyName = $propertyValue"
            $shellMetadata[$propertyName] = $propertyValue
        }
    }
    return $shellMetadata
}

# Retrieve all metadata
$fileMetadata = Get-FileMetadata -Path $FilePath
$extendedMetadata = Get-ExtendedFileMetadata -Path $FilePath
$adsMetadata = Get-AlternateDataStreams -Path $FilePath
$fileHashes = Get-FileHashMetadata -Path $FilePath
$ntfsAttributes = Get-NTFSAttributes -Path $FilePath
$signatureInfo = Get-DigitalSignature -Path $FilePath
$allShellProperties = Get-AllShellProperties -Path $FilePath
