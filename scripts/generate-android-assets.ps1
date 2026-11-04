Add-Type -AssemblyName System.Drawing

$srcLogo = [System.Drawing.Bitmap]::new((Resolve-Path "public/brand/pixelwind-logo.png").Path)
$srcLogoWhite = [System.Drawing.Bitmap]::new((Resolve-Path "public/brand/pixelwind-logo-white.png").Path)

function Create-Square-Icon($width, $isRound, $isForeground) {
    $bmp = [System.Drawing.Bitmap]::new($width, $width, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if (-not $isForeground) {
        if ($isRound) {
            $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
            $path.AddEllipse(0, 0, $width, $width)
            $g.SetClip($path)
        }
        $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 11, 31, 70)) # Navy #0B1F46
        $g.FillRectangle($brush, 0, 0, $width, $width)
    }

    # Center white logo inside
    $logo = $srcLogoWhite
    $aspect = $logo.Width / $logo.Height
    $targetW = [int]($width * 0.75)
    $targetH = [int]($targetW / $aspect)
    if ($targetH -gt ($width * 0.75)) {
        $targetH = [int]($width * 0.75)
        $targetW = [int]($targetH * $aspect)
    }

    $offsetX = [int](($width - $targetW) / 2)
    $offsetY = [int](($width - $targetH) / 2)

    $destRect = [System.Drawing.Rectangle]::new($offsetX, $offsetY, $targetW, $targetH)
    $g.DrawImage($logo, $destRect)

    $g.Dispose()
    return $bmp
}

$densities = @(
    @{ name = "mipmap-mdpi"; size = 48; fgSize = 108 },
    @{ name = "mipmap-hdpi"; size = 72; fgSize = 162 },
    @{ name = "mipmap-xhdpi"; size = 96; fgSize = 216 },
    @{ name = "mipmap-xxhdpi"; size = 144; fgSize = 324 },
    @{ name = "mipmap-xxxhdpi"; size = 192; fgSize = 432 }
)

foreach ($d in $densities) {
    $dir = "android/app/src/main/res/$($d.name)"
    if (Test-Path $dir) {
        $icon = Create-Square-Icon $d.size $false $false
        $icon.Save("$dir/ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $icon.Dispose()

        $roundIcon = Create-Square-Icon $d.size $true $false
        $roundIcon.Save("$dir/ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $roundIcon.Dispose()

        $fgIcon = Create-Square-Icon $d.fgSize $false $true
        $fgIcon.Save("$dir/ic_launcher_foreground.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $fgIcon.Dispose()

        Write-Host "Generated icons for $($d.name)"
    }
}

# Generate splash screen (480x800 portrait centered)
function Create-Splash($w, $h) {
    $bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Deep Navy Background
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 11, 31, 70))
    $g.FillRectangle($brush, 0, 0, $w, $h)

    $logo = $srcLogoWhite
    $aspect = $logo.Width / $logo.Height
    $targetW = [int]($w * 0.6)
    $targetH = [int]($targetW / $aspect)

    $offsetX = [int](($w - $targetW) / 2)
    $offsetY = [int](($h - $targetH) / 2)

    $destRect = [System.Drawing.Rectangle]::new($offsetX, $offsetY, $targetW, $targetH)
    $g.DrawImage($logo, $destRect)

    $g.Dispose()
    return $bmp
}

$splash = Create-Splash 480 800
$splash.Save("android/app/src/main/res/drawable/splash.png", [System.Drawing.Imaging.ImageFormat]::Png)
$splash.Dispose()
Write-Host "Generated splash.png"

$srcLogo.Dispose()
$srcLogoWhite.Dispose()
Write-Host "All assets generated successfully!"
