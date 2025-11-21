# start-all-services.ps1
# PowerShell script to start all Exhibition Management System services

Write-Host "🚀 Starting Exhibition Management System Services..." -ForegroundColor Green

# Function to start service in new terminal
function Start-ServiceInNewTerminal {
    param($Name, $Command, $WorkingDirectory)
    
    Write-Host "Starting $Name..." -ForegroundColor Yellow
    
    if ($WorkingDirectory) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; $Command" -WindowStyle Normal
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "$Command" -WindowStyle Normal
    }
    
    Start-Sleep -Seconds 2
}

# Start Auth Service
Start-ServiceInNewTerminal "Auth Service" "npm start" "backend\Organizer_Dashboard-main\backend-new\services\auth-service"

# Start API Gateway
Start-ServiceInNewTerminal "API Gateway" "npm start" "backend\Organizer_Dashboard-main\backend"

# Start Events API
Start-ServiceInNewTerminal "Events API" "npm start" "backend\events"

# Start Heatmap API (check if path exists)
if (Test-Path "backend\heatmap\backend\exhibition-map-backend") {
    Start-ServiceInNewTerminal "Heatmap API" "npm start" "backend\heatmap\backend\exhibition-map-backend"
} else {
    Write-Host "⚠️  Heatmap API path not found, skipping..." -ForegroundColor Orange
}

# Start Maps API
if (Test-Path "backend\Maps\backend map") {
    Start-ServiceInNewTerminal "Maps API" "npm start" "backend\Maps\backend map"
} else {
    Write-Host "⚠️  Maps API path not found, skipping..." -ForegroundColor Orange
}

Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Unified Server (Main)
Write-Host "🌐 Starting Unified Server (Main Entry Point)..." -ForegroundColor Green
Start-ServiceInNewTerminal "Unified Server" "node unified-server.js" $null

Start-Sleep -Seconds 5

Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Access Points:" -ForegroundColor Cyan
Write-Host "   📱 Main Application: http://localhost:8080" -ForegroundColor White
Write-Host "   ⚕️  Health Check: http://localhost:8080/health" -ForegroundColor White
Write-Host "   🔐 Auth API: http://localhost:8080/auth" -ForegroundColor White
Write-Host "   📅 Events API: http://localhost:8080/events-api" -ForegroundColor White
Write-Host "   🗺️  Maps API: http://localhost:8080/maps-api" -ForegroundColor White
Write-Host "   🔥 Heatmap API: http://localhost:8080/heatmap-api" -ForegroundColor White
Write-Host ""
Write-Host "📧 Email verification links will now work properly!" -ForegroundColor Green
Write-Host "🎯 All API calls should go through http://localhost:8080" -ForegroundColor Green

Read-Host "Press Enter to continue..."