# Fix UI package - prefix unused vars with underscore
(Get-Content packages\ui\src\components\zezamii-header.tsx) -replace 'const userName =', 'const _userName =' | Set-Content packages\ui\src\components\zezamii-header.tsx

# Fix API package - prefix unused vars with underscore  
(Get-Content packages\api\src\router\daypass.ts) -replace '(\bctx\b)(?=.*\):)', '_ctx' | Set-Content packages\api\src\router\daypass.ts
(Get-Content packages\api\src\router\events.ts) -replace '(\bctx\b)(?=.*\):)', '_ctx' | Set-Content packages\api\src\router\events.ts
(Get-Content packages\api\src\router\legacy.ts) -replace '(\bctx\b)(?=.*\):)', '_ctx' | Set-Content packages\api\src\router\legacy.ts
(Get-Content packages\api\src\services\legacy-api.ts) -replace '(\borgId\b)(?=.*\):)', '_orgId' | Set-Content packages\api\src\services\legacy-api.ts
(Get-Content packages\api\src\db\schema\orgs.ts) -replace '(\bone\b)(?=.*\):)', '_one' | Set-Content packages\api\src\db\schema\orgs.ts
