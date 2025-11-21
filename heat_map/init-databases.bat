@echo off
REM PostgreSQL Database Initialization Script (Batch version)
REM This script initializes the heatmap_db and organizer_dashboard databases

echo Starting PostgreSQL Database Initialization...
echo.

REM Set PostgreSQL connection parameters (modify these as needed)
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres

set /p PGPASSWORD="Enter PostgreSQL password for user '%PGUSER%': "

echo.
echo Initializing databases...

REM Initialize Heatmap Database
echo.
echo 1. Creating heatmap_db database...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -f "backend\heatmap\database\aa.sql"

if %errorlevel% equ 0 (
    echo [SUCCESS] Heatmap database created successfully!
) else (
    echo [ERROR] Error creating heatmap database
)

REM Initialize Organizer Dashboard Database
echo.
echo 2. Creating organizer_dashboard database schema...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -f "backend\Organizer_Dashboard-main\backend\db\script.sql"

if %errorlevel% equ 0 (
    echo [SUCCESS] Organizer dashboard schema created successfully!
    
    REM Insert sample data
    echo.
    echo 3. Inserting sample data into organizer_dashboard...
    psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -f "backend\Organizer_Dashboard-main\backend\db\insertData.sql"
    
    if %errorlevel% equ 0 (
        echo [SUCCESS] Sample data inserted successfully!
    ) else (
        echo [ERROR] Error inserting sample data
    )
) else (
    echo [ERROR] Error creating organizer dashboard schema
)

REM Verify databases
echo.
echo 4. Verifying database creation...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -t -c "SELECT datname FROM pg_database WHERE datname IN ('heatmap_db', 'organizer_dashboard');"

echo.
echo Database initialization completed!
echo.
echo Databases created:
echo - heatmap_db (with buildings, locations, zones, etc.)
echo - organizer_dashboard (with events, organizers, buildings, etc.)
echo.
echo You can now connect to these databases using:
echo psql -h localhost -U postgres -d heatmap_db
echo psql -h localhost -U postgres -d organizer_dashboard

set PGPASSWORD=
pause