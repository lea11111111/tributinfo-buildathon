# Limpia artefactos de parseo (Firecrawl) en corpus/parsed/*.md
# - Quita [Image: ImX] preservando la estructura de lineas
# - Quita pies de pagina repetidos ("Prohibida su reproduccion...")
# - Quita headers que quedan vacios (p.ej. "# " solo)
# - Colapsa 3+ lineas en blanco a 1
# Requiere PowerShell 7+ (pwsh). Uso: pwsh -File scripts\clean-corpus.ps1

$corpusDir = Join-Path $PSScriptRoot "..\corpus\parsed"

Get-ChildItem $corpusDir -Filter "*.md" | ForEach-Object {
    $c = Get-Content $_.FullName -Raw -Encoding UTF8
    $before = $c.Length

    # 1. [Image: ImX] (solo espacios/tabs alrededor, nunca newlines)
    $c = $c -replace '[ \t]*\[Image:[ \t]*Im\d+\]', ''

    # 2. Pie de pagina del PDF. Ojo: en regex .NET, $ no matchea antes de \r,
    #    asi que con archivos CRLF hay que cerrar con \r?$
    $c = $c -replace '(?m)^Prohibida su reproducci.n( impresa o digital sin autorizaci.n)?[ \t]*\r?$', ''
    $c = $c -replace '[ \t]*---[ \t]*Prohibida su reproducci.n impresa o digital sin autorizaci.n[ \t]*---[ \t]*', ' '

    # 3. Headers que quedaron vacios
    $c = $c -replace '(?m)^[ \t]*#{1,6}[ \t]*\r?$', ''

    # 4. Lineas solo con espacios
    $c = $c -replace '(?m)^[ \t]+\r?$', ''

    # 5. Colapsar 3+ saltos de linea a 2, y separadores --- repetidos a uno
    $c = $c -replace '(\r?\n){3,}', "`r`n`r`n"
    $c = $c -replace '(?m)(^---[ \t]*\r?\n\r?\n){2,}', "---`r`n`r`n"

    if ($c.Length -ne $before) {
        [IO.File]::WriteAllText($_.FullName, $c, [Text.UTF8Encoding]::new($false))
    }
    Write-Host ("{0}: -{1} chars" -f $_.Name, ($before - $c.Length))
}

Write-Host ""
$rest = Get-ChildItem $corpusDir -Filter "*.md" | Select-String -Pattern '\[Image:' -Encoding utf8 | Measure-Object
Write-Host ("[Image:] restantes: {0}" -f $rest.Count)
