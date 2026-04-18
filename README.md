# 2025-2026-webapp
Baja Wildcat Racing web app

**Development Stack**

Fontend:
* React
* TypeScript & JavaScript
*  Docker Image (.NET): Node.js - The runtime environment used to build and serve the react frontend

Backend
* .NET (C#) - Logic and API endpoints
* Docker Image (.NET): Official .NET image
* Maps API endpoints to Database and checks keycloak Auth tokens
* Run `dotnet add package DotNetEnv` in ./backend folder since it is needed for .env to read connection string

Database:
* PostgreSQL - The relational database for persistent data storage
* Docker Volumes - Used to ensure database data persists even if the container is restarted or removed
* Docker Image (.NET): postgres 17

IAM (Identity & Access Management)
* Keycloak: An open-source identity and access management
* Dedicated Image: Standalone container to handle authentication and authorization for whole stack
* Keycloak Database: Temporary H2 database (Migration to other database needed!)

# Setup 
1. Clone Repository 
2. Change into root folder "2025-2026-webapp"
3. Run Docker
4. Run `make build` to the main project and wait until built
5. Open browser of choice and head to an local endpoint to login:
* http://localhost:5173/


# Notes
Makefile used for easy running and cleaning.

#### `make build`
- Builds and starts containers (most run when changes made without `make watch`)
- Rebuilds Docker images
- Starts services in background
- Runs the Python script

#### `make up`
- Starts everything
- Runs the Python stream script in the background
- Starts Docker containers in detached mode

#### `make down`
- Stops everything
- Stops Docker containers
- Kills the background Python script

#### `make watch`
- Runs in docker watch mode (can see frontend edits in real time)
- Runs Docker with live file watching (auto-rebuild/restart on changes)
- Starts Python stream script

#### `make clean`
- Performs a full Docker cleanup
- Removes stopped containers
- Stops and removes volumes
- Prunes unused Docker data

#### `make reset`
- Resets the environment from scratch.
- Stops everything
- Removes containers and volumes
- Cleans Docker system
- Rebuilds and starts fresh

#### `make no_cache`
- Builds Docker images without using cache.
- Useful if changes aren’t being picked up

#### `make reset`
* If things get weird or broken, run `make reset` to start clean.
* if you "control + d" out of running program, watch out for python script in the backend, use `ps` and kill process if needed