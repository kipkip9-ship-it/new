![Tests](https://github.com/kipkip9-ship-it/users-api/actions/workflows/test.yml/badge.svg)

# Users API

A REST API for managing users, departments, and tasks, built with Node.js, hapi, and PostgreSQL.

I built this project to practise designing and testing REST APIs, working with relational databases, and handling data validation and relationships between resources.

# Features

- Create, view, update, and delete users, departments, and tasks.
- Validate incoming data with Joi.
- Use PostgreSQL foreign keys and `RESTRICT` constraints to protect related records.
- Filter, search, sort, and paginate tasks.
- Run 57 integration tests against a real PostgreSQL test database.

# Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** hapi
- **Database:** PostgreSQL 14+
- **Validation:** Joi
- **Testing:** hapi/lab and hapi/code

# Getting Started

# Prerequisites

Make sure you have Node.js and PostgreSQL installed before getting started.

# Installation

1. Clone the repository and move into the project directory.

   ```bash
   git clone https://github.com/kipkip9-ship-it/users-api.git
   cd users-api
   ```

2. Install the dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file from the example configuration and add your PostgreSQL connection details.

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, you can use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Run the database migration.

   ```bash
   npm run migrate
   ```

5. Start the API.

   ```bash
   npm start
   ```

The server runs at `http://localhost:3000`.

# Running Tests

The project includes integration tests that exercise the API against a separate PostgreSQL test database.

1. Create the test database:

   ```bash
   psql -U postgres -c "CREATE DATABASE users_api_test;"
   ```

2. Copy `.env.example` to `.env.test` and configure it to use the test database by setting `DB_NAME=users_api_test`.

3. Run the test database migration:

   ```bash
   npm run migrate:test
   ```

4. Run the tests:

   ```bash
   npm test
   ```

**Note:** Make sure your test configuration points to `users_api_test`, not your development database, so your tests don't affect your development data.

## API Endpoints

All endpoints are relative to `http://localhost:3000`.

# Health Check

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check whether the API is running |

# Users

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/users` | Create a user |
| `GET` | `/api/users` | List users |
| `GET` | `/api/users/{id}` | Get a user by ID |
| `PUT` | `/api/users/{id}` | Update a user |
| `DELETE` | `/api/users/{id}` | Delete a user |

# Departments

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/departments` | Create a department |
| `GET` | `/api/departments` | List departments |
| `GET` | `/api/departments/{id}` | Get a department by ID |
| `PUT` | `/api/departments/{id}` | Update a department |
| `DELETE` | `/api/departments/{id}` | Delete a department |

# Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks` | List tasks |
| `GET` | `/api/tasks/{id}` | Get a task by ID |
| `PUT` | `/api/tasks/{id}` | Update a task |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `GET` | `/api/tasks/filter` | Filter tasks |
| `GET` | `/api/tasks/paginated` | Retrieve tasks in pages |
| `GET` | `/api/tasks/search` | Search tasks |
| `GET` | `/api/tasks/sort` | Sort tasks |

# Current Limitations

The following features are not implemented yet:

- Authentication and authorization
- Rate limiting
- OpenAPI documentation

# Future Improvements

Some areas I'd like to explore next are API documentation, authentication, and additional production-ready security features.

# License

No license has been specified yet.
