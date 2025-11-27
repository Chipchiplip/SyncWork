# PowerShell script to run Entity Framework migrations

Write-Host "Creating migration..." -ForegroundColor Green
dotnet ef migrations add InitialCreate --project TaskManager.csproj

Write-Host "Updating database..." -ForegroundColor Green
dotnet ef database update --project TaskManager.csproj

Write-Host "Migrations completed!" -ForegroundColor Green

