# PowerShell script to help set up the database
# This script will guide you through database setup

Write-Host "=== MemeBot Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check for Docker
Write-Host "Checking for Docker..." -ForegroundColor Yellow
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerAvailable) {
    Write-Host "✓ Docker is installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting PostgreSQL and Redis containers..." -ForegroundColor Yellow
    
    docker compose up -d postgres redis
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Containers started!" -ForegroundColor Green
        Write-Host "Waiting for databases to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "Running database migrations..." -ForegroundColor Yellow
        npm run db:migrate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database migrations completed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Generating Prisma client..." -ForegroundColor Yellow
            npm run db:generate
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Prisma client generated!" -ForegroundColor Green
                Write-Host ""
                Write-Host "=== Database Setup Complete! ===" -ForegroundColor Green
                Write-Host ""
                Write-Host "Next steps:" -ForegroundColor Cyan
                Write-Host "1. Add yourself as admin: npm run setup-admin 7290497391 admin admin" -ForegroundColor White
                Write-Host "2. Start the bot: npm run dev" -ForegroundColor White
            }
        }
    } else {
        Write-Host "✗ Failed to start containers" -ForegroundColor Red
        Write-Host "Make sure Docker Desktop is running" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Docker is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Install PostgreSQL locally and update DATABASE_URL in .env" -ForegroundColor White
    Write-Host "3. Use a cloud database service (like Supabase, Railway, etc.)" -ForegroundColor White
    Write-Host ""
    Write-Host "For quick testing, Docker is the easiest option!" -ForegroundColor Yellow
}


