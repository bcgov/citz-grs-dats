param (
    [string]$FilePath
)

if (-Not (Test-Path -Path $FilePath -PathType Leaf)) {
    Write-Host "File does not exist."
    exit
}

function Get-FileMetadata {
    param (
        [string]$Path
    )

    $file = Get-Item -Path $Path
    $metadata = @{
        Name = $file.Name
        FullName = $file.FullName
        Extension = $file.Extension
        Size = $file.Length
        CreationTime = $file.CreationTime
        LastAccessTime = $file.LastAccessTime
        LastWriteTime = $file.LastWriteTime
        Attributes = $file.Attributes
    }

    return $metadata
}

$fileMetadata = Get-FileMetadata -Path $FilePath
$fileMetadata | ConvertTo-Json -Depth 10
