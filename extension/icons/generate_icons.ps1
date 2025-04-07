# This script requires Inkscape to be installed
# You can download it from https://inkscape.org/

# Path to Inkscape executable (adjust as needed)
$inkscape = "C:\Program Files\Inkscape\bin\inkscape.exe"

# Generate icons in different sizes
& $inkscape --export-filename="icon16.png" --export-width=16 --export-height=16 "icon.svg"
& $inkscape --export-filename="icon48.png" --export-width=48 --export-height=48 "icon.svg"
& $inkscape --export-filename="icon128.png" --export-width=128 --export-height=128 "icon.svg"

Write-Host "Icons generated successfully!"
