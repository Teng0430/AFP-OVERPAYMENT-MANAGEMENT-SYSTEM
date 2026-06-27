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
- **Development Tools** (for scaffolding local environment)
  - Runtime: PHP 8.3, Node.js 22.x LTS
  - Package Managers: Composer 2.8.x, npm 11.x
