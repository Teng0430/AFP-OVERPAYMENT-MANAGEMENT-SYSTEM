param(
    [switch]$Install
)

$tools = @(
    @{ Name = "node"; CheckCommand = "node --version"; InstallCommand = "winget install OpenJS.NodeJS.LTS" },
    @{ Name = "npm"; CheckCommand = "npm --version"; InstallCommand = "winget install OpenJS.NodeJS.LTS" },
    @{ Name = "php"; CheckCommand = "php --version"; InstallCommand = "winget install PHP.PHP.8.3" },
    @{ Name = "python"; CheckCommand = "python --version"; InstallCommand = "winget install Python.Python.3.12" },
    @{ Name = "uv"; CheckCommand = "uv --version"; InstallCommand = 'powershell -c "irm https://astral.sh/uv/install.ps1 | iex"' },
    @{ Name = "composer"; CheckCommand = "composer --version"; InstallCommand = "winget install Composer.Composer" }
)

$passCount = 0
$failCount = 0

Write-Output "========================================"
Write-Output "  Tool Check Script"
Write-Output "========================================"

foreach ($tool in $tools) {
    Write-Output "----------------------------------------"
    Write-Output "Checking $($tool.Name)..."

    $checkResult = $null
    try {
        $checkResult = Invoke-Expression $tool.CheckCommand 2>&1
    } catch {
        $checkResult = $null
    }

    if ($LASTEXITCODE -eq 0 -and $checkResult) {
        $versionLine = ($checkResult | Select-Object -First 1).Trim()
        Write-Output "[PASS] $($tool.Name) is available. Version: $versionLine"
        $passCount++
    } else {
        $errorMsg = ($checkResult | Out-String).Trim()
        if ($errorMsg) {
            Write-Output $errorMsg
        }

        if ($tool.Name -eq "npm") {
            Write-Output "npm check failed. Attempting to set execution policy..."
            Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
            try {
                $checkResult = Invoke-Expression $tool.CheckCommand 2>&1
            } catch {
                $checkResult = $null
            }
            if ($LASTEXITCODE -eq 0 -and $checkResult) {
                $versionLine = ($checkResult | Select-Object -First 1).Trim()
                Write-Output "[PASS] $($tool.Name) is available. Version: $versionLine"
                $passCount++
                continue
            }
        }

        if ($Install) {
            Write-Output "$($tool.Name) is not available. Installing..."
            try {
                Invoke-Expression $tool.InstallCommand 2>&1 | ForEach-Object { Write-Output $_ }
                Write-Output "$($tool.Name) installation completed."
                try {
                    $checkResult = Invoke-Expression $tool.CheckCommand 2>&1
                } catch {
                    $checkResult = $null
                }
                if ($LASTEXITCODE -eq 0 -and $checkResult) {
                    $versionLine = ($checkResult | Select-Object -First 1).Trim()
                    Write-Output "[PASS] $($tool.Name) is available. Version: $versionLine"
                    $passCount++
                } else {
                    Write-Output "[FAIL] $($tool.Name) installation may have failed."
                    $failCount++
                }
            } catch {
                Write-Output "Failed to install $($tool.Name): $_"
                $failCount++
            }
        } else {
            Write-Output "[FAIL] $($tool.Name) is not available. Use -Install to auto-install."
            $failCount++
        }
    }
}

Write-Output "========================================"
Write-Output "  Check complete. Passed: $passCount, Failed: $failCount"
Write-Output "========================================"