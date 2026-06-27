## Tech Stack

- **Backend**
  - Framework: Laravel 11 (web api)
  - Database: MySQL, decide what best version
  - Authentication: Laravel Sanctum
  - Test Framework: Pest, in-memory database via SQLite
- **Frontend**
  - Framework: React, decide what best version to match Laravel 11
  - Test Framework: Vitest
  - Dependencies: axios, bcrypt, jsonwebtoken, react-router-dom
- **Rules**
  - Never read .env or .env\* files, use .env.example for references
  - Create applications in `apps` folder
  - supporting documents in `docs`
