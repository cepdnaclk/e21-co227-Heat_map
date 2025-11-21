# # Install dependencies and start services (default behavior)
# .\all-start.ps1

# # Only install dependencies
# .\all-start.ps1 -Action install

# # Only start services
# .\all-start.ps1 -Action start

# # Install and start (explicit)
# .\all-start.ps1 -Action both



# Script parameters
param(
    [string]$Action = "both"  # Options: "install", "start", "both"
)

# Display usage information
function Show-Usage {
    Write-Host ""
    Write-Host "Usage: .\all-start.ps1 [-Action <action>]"
    Write-Host ""
    Write-Host "Actions:"
    Write-Host "  install  - Only install npm dependencies"
    Write-Host "  start    - Only start services"
    Write-Host "  both     - Install dependencies and start services (default)"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\all-start.ps1                  # Install and start (default)"
    Write-Host "  .\all-start.ps1 -Action install  # Only install dependencies"
    Write-Host "  .\all-start.ps1 -Action start    # Only start services"
    Write-Host ""
}

# Validate action parameter
if ($Action -notin @("install", "start", "both")) {
    Write-Host "Error: Invalid action '$Action'" -ForegroundColor Red
    Show-Usage
    exit 1
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "=== Installing Dependencies ===" -ForegroundColor Green
    
    # Install node modules for all microservices and api-gateway
    $folders = @(
        ".\",
        ".\backend\Maps\backend map",
        ".\backend\heatmap\backend\exhibition-map-backend",
        ".\backend\events"
    )

    foreach ($folder in $folders) {
        Write-Host "Installing in $folder" -ForegroundColor Yellow
        cd $folder
        npm install
        cd $PSScriptRoot
    }

    $folders5 = @(
        ".\backend\Organizer_Dashboard-main\backend\api-gateway",
        ".\backend\Organizer_Dashboard-main\backend\services\alert-service",
        ".\backend\Organizer_Dashboard-main\backend\db",
        ".\backend\Organizer_Dashboard-main\backend\services\auth-service",
        ".\backend\Organizer_Dashboard-main\backend\services\building-service",
        ".\backend\Organizer_Dashboard-main\backend\services\event-service",
        ".\backend\Organizer_Dashboard-main\backend\services\orgMng-service"
    )

    foreach ($folder in $folders5) {
        Write-Host "Installing in $folder" -ForegroundColor Yellow
        cd $folder
        npm install
        npm install dotenv
        cd $PSScriptRoot
    }
    
    Write-Host "=== Dependencies Installation Complete ===" -ForegroundColor Green
}

# Function to start services
function Start-Services {
    Write-Host "=== Starting Services ===" -ForegroundColor Green
    
    # Start all microservices and api-gateway using the dedicated script
    Write-Host "Starting Organizer Dashboard services..." -ForegroundColor Yellow
    cd ".\backend\Organizer_Dashboard-main"
    .\start-all.ps1
    cd $PSScriptRoot

    $folders1 = @(
        ".\",
        ".\backend\events"
    )

    foreach ($folder in $folders1) {
        Write-Host "Starting npm run dev in $folder" -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$folder'; npm run dev" -WindowStyle Normal
    }

    $folders2 = @(
        ".\backend\Maps\backend map"
    )

    foreach ($folder in $folders2) {
        Write-Host "Starting node app.js in $folder" -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$folder'; node app.js" -WindowStyle Normal
    }

    $folders3 = @(
        ".\backend\heatmap\backend\exhibition-map-backend"
    )

    foreach ($folder in $folders3) {
        Write-Host "Starting node index.js in $folder" -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$folder'; node index.js" -WindowStyle Normal
    }
    
    Write-Host "=== All Services Started ===" -ForegroundColor Green
}

# Execute based on action parameter
Write-Host "Action: $Action" -ForegroundColor Cyan

switch ($Action) {
    "install" {
        Install-Dependencies
    }
    "start" {
        Start-Services
    }
    "both" {
        Install-Dependencies
        Write-Host ""
        Start-Services
    }
}

Write-Host ""
Write-Host "Script execution completed!" -ForegroundColor Green