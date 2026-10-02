# Reads the PNG named in LOGO_FILE and prints its width, its height, then one
# RRGGBBAA value per pixel, row by row. The path comes in as an environment
# value, never on the command line.
#
# A PNG of LOGO_MAX pixels a side or smaller is drawn pixel for pixel: somebody
# drew it for this size, and resampling would blur what they placed by hand.
# A bigger PNG has its see-through border trimmed first, so the mark fills the
# space, and is then shrunk to fit LOGO_W by LOGO_H with its proportions kept.
Add-Type -AssemblyName System.Drawing
$src = New-Object System.Drawing.Bitmap $env:LOGO_FILE
$max = [int]$env:LOGO_MAX

if ($src.Width -le $max -and $src.Height -le $max) {
  $w = $src.Width
  $h = $src.Height + ($src.Height % 2)
  $box = New-Object System.Drawing.Rectangle 0, 0, $src.Width, $src.Height
  $fit = New-Object System.Drawing.RectangleF 0, 0, $src.Width, $src.Height
  $mode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
} else {
  # Look every 2nd pixel for the edge of the mark; a full pass is slow here.
  $left = $src.Width; $top = $src.Height; $right = 0; $bottom = 0
  for ($y = 0; $y -lt $src.Height; $y += 2) {
    for ($x = 0; $x -lt $src.Width; $x += 2) {
      if ($src.GetPixel($x, $y).A -ge 128) {
        if ($x -lt $left) { $left = $x }; if ($x -gt $right) { $right = $x }
        if ($y -lt $top) { $top = $y }; if ($y -gt $bottom) { $bottom = $y }
      }
    }
  }
  if ($right -lt $left) { $left = 0; $top = 0; $right = $src.Width - 1; $bottom = $src.Height - 1 }
  $box = New-Object System.Drawing.Rectangle $left, $top, ($right - $left + 1), ($bottom - $top + 1)
  $w = [int]$env:LOGO_W
  $h = [int]$env:LOGO_H
  $s = [Math]::Min($w / $box.Width, $h / $box.Height)
  $dw = $box.Width * $s; $dh = $box.Height * $s
  $fit = New-Object System.Drawing.RectangleF ([single](($w - $dw) / 2)), ([single](($h - $dh) / 2)), ([single]$dw), ([single]$dh)
  $mode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
}

$picture = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($picture)
$g.InterpolationMode = $mode
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$g.DrawImage($src, $fit, $box, [System.Drawing.GraphicsUnit]::Pixel)

$px = for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $c = $picture.GetPixel($x, $y)
    '{0:X2}{1:X2}{2:X2}{3:X2}' -f $c.R, $c.G, $c.B, $c.A
  }
}
"$w $h " + ($px -join ' ')
