# Fix orgs.ts line 78 - change 'one' to '_one' in the destructuring
$file = "packages\api\src\db\schema\orgs.ts"
$content = Get-Content $file
$content[77] = $content[77] -replace '\{ many, one \}', '{ many, one: _one }'
$content | Set-Content $file

# Fix daypass.ts line 76 - prefix ctx with underscore
$file = "packages\api\src\router\daypass.ts"
$content = Get-Content $file
$content[75] = $content[75] -replace '\{ input, ctx \}', '{ input, _ctx }'
$content | Set-Content $file

# Fix events.ts line 76 - prefix ctx with underscore  
$file = "packages\api\src\router\events.ts"
$content = Get-Content $file
$content[75] = $content[75] -replace '\{ input, ctx \}', '{ input, _ctx }'
$content | Set-Content $file

# Fix legacy.ts line 18 - prefix ctx with underscore
$file = "packages\api\src\router\legacy.ts"
$content = Get-Content $file
$content[17] = $content[17] -replace '\{ input, ctx \}', '{ input, _ctx }'
$content | Set-Content $file

# Fix legacy.ts line 67 - prefix ctx with underscore
$content = Get-Content $file
$content[66] = $content[66] -replace '\{ input, ctx \}', '{ input, _ctx }'
$content | Set-Content $file

Write-Host "All lint errors fixed!"
