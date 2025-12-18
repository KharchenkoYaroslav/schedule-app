# 📅 Schedule App

This project is a comprehensive educational scheduling platform built as a monorepo using Nx, NestJS, and React. It features a scalable microservices architecture powered by RESTful APIs, gRPC, and RabbitMQ, designed primarily to provide instant, open access to dynamic timetables for students and staff, supported by a secure administrative core for managing academic resources.

## 📦 Technologies

- `TypeScript`
- `Nx`
- `NestJS`
- `gRPC`
- `RabbitMQ`
- `Docker`
- `TypeORM`
- `Vite`
- `React`
- `SCSS`

## 🌐 Public Features

The public interface is designed for quick and easy lookup of educational timetables for students and staff.

- **Smart Search**: Instantly find study groups or teachers by name using a responsive search interface.
- **Group Schedules**: View detailed weekly timetables including subjects, locations, and teachers. 
- **Teacher Timetables**: Access individual schedules for lecturers to track their classes.
- **Two-Week View**: The schedule automatically displays both the current and the upcoming week simultaneously.
- **Interlinked Navigation**: Teacher and group names within the schedule are clickable links that navigate directly to their timetables.

## 🛠 Administrative Tools

A restricted area for authorized personnel to manage the educational process and resources.

- **High-Efficiency Workflow**: Implimanted **pair swapping** and **keyboard shortcuts** system allows for rapid schedule editing.
- **Smart Scheduling Engine**: Automatic **conflict protection** to prevent overlaps, and **smart linking** that automatically connects pairs to a teacher's existing lesson if it exists.
- **Academic Lifecycle Management**: Includes a **Year Shifting** tool for the instant transfer of the schedule structure to the next academic year.
- **Curriculum Control**: Tools to monitor and ensure the complete execution of the academic plan for every group and subject.
- **Resource Management**: Full control over curricula, groups, and teacher information.

## 🛡 Security & Governance

Built with a focus on data integrity, accountability, and controlled access.

- **Strict Access Control**: A **Whitelist-based registration** system ensures that only pre-approved personnel can create administrative accounts.
- **Comprehensive Auditing**: A dedicated logging microservice records every administrative action (modifications, deletions, logins), creating an immutable history.
- **Role-Based Permissions**: Granular access levels (Admin, Super Admin) ensure users operate strictly within their authorised scope.

## 🏗️ System Architecture

The system follows a scalable microservices architecture managed within an **Nx** monorepo. It leverages different communication protocols to ensure performance and reliability:

- **Gateway Service** (`REST API`): The main entry point that aggregates data from internal services and routes requests from the client.
- **Auth Service** & **Schedule Service** (`gRPC`): High-performance internal microservices responsible for core business logic and data management.
- **Logger Service** (`RabbitMQ`): A dedicated service for logging administrator actions. It processes logs asynchronously via RabbitMQ to ensure that the main application processes remain unblocked and efficient.
- **Client** (`React`): A modern Single Page Application (SPA) consuming the Gateway API.

## 📂 Project Structure

This monorepo project is organised into the following applications:

- `apps/client` - Frontend application built with React and Vite.
- `apps/gateway` - API Gateway acting as the public interface.
- `apps/auth` - Authentication microservice handling users and roles.
- `apps/schedule` - Core schedule management microservice.
- `apps/logger` - Centralised audit logging microservice.

## 📚 API Documentation

The project provides auto-generated documentation for developers to explore endpoints, event schemas, and service contracts:

- **REST API (Swagger)**: Interactive API documentation is available at the Gateway service.
  - URL: `http://localhost:{SERVER_PORT}/api/docs`
- **Event-Driven API (AsyncAPI)**: Documentation for RabbitMQ events is available at the Logger service.
  - URL: `http://localhost:{LOGGER_PORT}/async-api`
- **gRPC API (Protobuf)**: Service contracts and message definitions are documented directly in the `.proto` files.
  - Auth Service: [`apps/auth/src/app/proto/auth.proto`](apps/auth/src/app/proto/auth.proto)
  - Schedule Service: [`apps/schedule/src/app/proto/schedule.proto`](apps/schedule/src/app/proto/schedule.proto)
> [!NOTE]
> Swagger and AsyncAPI documentation are not available statically or when running in `production` mode.

## 🧪 Testing

The project ensures reliability through comprehensive testing suites powered by **Jest** and **Cypress**.

### 🛠 Running Tests
You can verify business logic and user flows using the following commands:

1. Run `npx nx run-many --target=test` for Unit & Integration tests for all applications and libraries.

2. Run `npx nx run client-e2e:open` for End-to-End tests.
> [!NOTE]
> Requires **Auth Service** & **Schedule Service** & **Logger Service** to be running with the `test` configuration

## ℹ️ Environment

```
# Database Connection URLs (Production)
AUTH_DATABASE_URL=postgresql://user:password@host:port/auth_db
SCHEDULE_DATABASE_URL=postgresql://user:password@host:port/schedule_db
LOGS_DATABASE_URL=postgresql://user:password@host:port/logs_db

# Database Connection URLs (Testing/Development)
# Required for running e2e tests
AUTH_DATABASE_TEST_URL=postgresql://user:password@host:port/auth_test_db
SCHEDULE_DATABASE_TEST_URL=postgresql://user:password@host:port/schedule_test_db
LOGS_DATABASE_TEST_URL=postgresql://user:password@host:port/logs_test_db

# JWT Configuration
# Generate strong random strings for these secrets
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Super Admin Credentials
# Used for initial setup and emergency access
SUPER_ADMIN_LOGIN=Head Admin
SUPER_ADMIN_PASSWORD=strong_password

# Service Configuration & Ports
VITE_API_URL=http://localhost:4000/v1
SERVER_PORT=4000
AUTH_SERVICE_URL=localhost:4010
SHEDULE_SERVICE_URL=localhost:4020
LOGGER_PORT=4030

# Message Broker Configuration
RABBITMQ_URL=amqp://user:password@localhost:5672
```

## 🚦 Running the Project

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add the necessary variables as described in the **Environment** section.
4. Start the RabbitMQ
5. Start the applications:
You can run the entire platform at once or start specific services as needed.

Option A: Run All Services 
```
npx nx run-many --target=serve --all --parallel=5
```
Option B: Run Services Individually (Recommended for development)
```
# Backend Services
npx nx serve gateway
npx nx serve auth
npx nx serve schedule
npx nx serve logger

# Frontend
npx nx serve client
```
Option C: Running in Test Mode is required when executing E2E tests to utilise test databases.
```
npx nx serve auth --configuration=test
npx nx serve schedule --configuration=test
npx nx serve logger --configuration=test
```
6. Open `http://localhost:4200` in your browser
> [!TIP]
> Highly recommend installing the Nx Console extension for VS Code.

## 🎞️ Preview

https://github.com/user-attachments/assets/29e67c52-8c07-4963-837a-ea10e06d6b61

> [!NOTE]
> The preview demonstrates the creation of a schedule for a group, with curriculum written in advance.
