# 2025-2026-webapp
Baja Wildcat Racing web app

**Development Stack**
Note: Make sure Docker is running

Fontend: m
* React
* TypeScript & JavaScript
* Node.js - The runtime environment used to build and serve the frontend assets

Backend
* .NET (C#) - Logic and API endpoints
* Docker Image (.NET): Official .NET image
* Run `dotnet add package DotNetEnv` in ./backend folder sicne it is needed for .env to read connection string

Database:
* PostgreSQL - The relational database for persistent data storage
* Docker Volumes - Used to ensure database data persists even if the container is restarted or removed

IAM (Identity & Access Management)
* Keycloak: An open-source identity and access management
* Dedicated Image: Standalone container to handle authentication and authorization for whole stack
* Keycloak Database: Temporary H2 database


# Setup 