# SalonHub Microservices System Test
Write-Host "================================" -ForegroundColor Cyan
Write-Host "SalonHub Microservices Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Main Backend"; Port=5000},
    @{Name="Profile Service"; Port=6001},
    @{Name="Booking Service"; Port=6002},
    @{Name="Payment Service"; Port=6003}
)

Write-Host "Checking if services are running..." -ForegroundColor Yellow
Write-Host ""

$allRunning = $true
foreach ($service in $services) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($connection) {
            Write-Host "[OK] $($service.Name) is running on port $($service.Port)" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] $($service.Name) is NOT running on port $($service.Port)" -ForegroundColor Red
            $allRunning = $false
        }
    } catch {
        Write-Host "[FAIL] $($service.Name) is NOT running on port $($service.Port)" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""
if ($allRunning) {
    Write-Host "SUCCESS: All microservices are running!" -ForegroundColor Green
} else {
    Write-Host "FAILURE: Some services are not running" -ForegroundColor Red
}
Write-Host ""
