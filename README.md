# users-api

A REST API for users, departments, and tasks built with Node.js, hapi, and PostgreSQL.

## Features
- CRUD for users, departments, and tasks
- Joi validation on all inputs
- FK integrity via PostgreSQL RESTRICT constraints
- Task filtering, pagination, search, and sorting
- 56 integration tests against a real test database

## Setup
\\\ash
npm install
cp .env.example .env       # fill in DB credentials
npm run migrate
npm start
\\\

## Testing
\\\ash
psql -U postgres -c "CREATE DATABASE users_api_test;"
# copy .env.example to .env.test, set DB_NAME=users_api_test
npm run migrate:test
npm test
\\\

## Endpoints
- GET /health
- POST /api/users, GET /api/users, GET /api/users/{id}, PUT /api/users/{id}, DELETE /api/users/{id}
- POST /api/departments, GET /api/departments, GET /api/departments/{id}, PUT /api/departments/{id}, DELETE /api/departments/{id}
- POST /api/tasks, GET /api/tasks, GET /api/tasks/{id}, PUT /api/tasks/{id}, DELETE /api/tasks/{id}
- GET /api/tasks/filter, GET /api/tasks/paginated, GET /api/tasks/search, GET /api/tasks/sort

## Not implemented
- Authentication / authorization
- Rate limiting
- OpenAPI documentation