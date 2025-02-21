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
        $properties = Get-ItemProperty -Path $Path
    } catch {
        Write-Error $_
        exit 1
    }

    $metadata = @{}

    # Add all properties dynamically
    foreach ($property in $properties.PSObject.Properties) {
        write-host $property.Name  = $property.Value
        $metadata[$property.Name] = $property.Value
    }


    return $metadata["length"]
}

$fileMetadata = Get-FileMetadata -Path $FilePath
