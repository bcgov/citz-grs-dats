param (
    [string]$FolderPath
)

if (-Not (Test-Path -Path $FolderPath -PathType Container)) {
    Write-Host "Folder does not exist."
    exit
}

function Get-FolderMetadata {
    param (
        [string]$Path
    )

    $folder = Get-Item -Path $Path
    $metadata = @{
        Name = $folder.Name
        FullName = $folder.FullName
        CreationTime = $folder.CreationTime
        LastAccessTime = $folder.LastAccessTime
        LastWriteTime = $folder.LastWriteTime
        Attributes = $folder.Attributes
        Files = @()
        SubFolders = @()
    }

    $files = Get-ChildItem -Path $Path -File
    foreach ($file in $files) {
        $fileMetadata = @{
            Name = $file.Name
            FullName = $file.FullName
            Extension = $file.Extension
            Size = $file.Length
            CreationTime = $file.CreationTime
            LastAccessTime = $file.LastAccessTime
            LastWriteTime = $file.LastWriteTime
            Attributes = $file.Attributes
        }
        $metadata.Files += $fileMetadata
    }

    $subFolders = Get-ChildItem -Path $Path -Directory
    foreach ($subFolder in $subFolders) {
        $subFolderMetadata = Get-FolderMetadata -Path $subFolder.FullName
        $metadata.SubFolders += $subFolderMetadata
    }

    return $metadata
}

$folderMetadata = Get-FolderMetadata -Path $FolderPath
$folderMetadata | ConvertTo-Json -Depth 10
