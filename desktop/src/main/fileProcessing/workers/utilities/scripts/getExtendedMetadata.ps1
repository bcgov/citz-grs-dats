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

# Retrieve both standard and extended metadata
$fileMetadata = Get-FileMetadata -Path $FilePath
$extendedMetadata = Get-ExtendedFileMetadata -Path $FilePath
