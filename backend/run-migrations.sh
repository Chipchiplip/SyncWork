#!/bin/bash
# Script to run Entity Framework migrations

echo "Creating migration..."
dotnet ef migrations add InitialCreate --project backend/TaskManager.csproj

echo "Updating database..."
dotnet ef database update --project backend/TaskManager.csproj

echo "Migrations completed!"

