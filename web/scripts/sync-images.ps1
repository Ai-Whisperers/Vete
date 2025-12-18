Write-Host "Syncing images from .content_data to public..."
$source = "web/.content_data/adris/images"
$dest = "web/public/adris/images"

if (!(Test-Path $dest)) {
    New-Item -ItemType Directory -Force -Path $dest
}

Copy-Item -Path "$source/*" -Destination $dest -Recurse -Force
Write-Host "Sync complete."
