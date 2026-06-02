# AutoPulse Backend API

Spring Boot REST API for the AutoPulse Enterprise Management and Scheduling System.

## Project Description
AutoPulse is an enterprise-grade web platform specifically designed to centralize, automate, and secure the entire operational cycle of a modern auto repair shop. It resolves fragmented administrative processes by offering:
- **Rigorous Role-Based Access Control (RBAC):** Dedicated portals for Clients, Mechanics, Managers, and Admins via a JPA JOINED inheritance strategy.
- **Advanced Security:** Infrastructure protection via RateLimitFilter against brute-force attacks and hybrid concurrent session control (token versioning) to guarantee a strict single active session per account.
- **Smart Scheduling:** An HR-Operational correlation algorithm that prevents overbooking and automatically excludes mechanics on leave from task distributions.

## Tech Stack
- **Java 25** + **Spring Boot 4+**
- **Spring Security** + **JWT** (Stateless authentication)
- **Hibernate / Spring Data JPA**
- **Neon Serverless PostgreSQL**
- **Maven**

## Setup & Execution

### 1. Prerequisites
- Java Development Kit (JDK) 25
- PostgreSQL database instance (local or Neon)
- Node.js and npm
- Angular CLI 21
- Maven

### 2. Environment Configuration
1. Initialize the local database server and create a new schema named autopulse db.
2. Navigate to the backend configuration directory: backend/src/main/resources/.
3. Open the application.properties (or env.properties, provided it is mapped
via @PropertySource) file and set the database credentials alongside the JWT parameters:

```
# Database Configuration
spring . datasource . url = jdbc : postgresql :// localhost :5432/autopulse_db
spring . datasource . username = your_db_username
spring . datasource . password = your_db_password
spring . jpa . hibernate . ddl - auto = update

# JWT Security Configuration
jwt . secret = YourSuperSecretKeyHere ...
jwt . expiration =86400000
```

### 3. Run the Application Backend

Open the backend repository in the preferred Integrated Development Environ-
ment (IDE) equipped with Spring tools (e.g., VS Code, Eclipse).

**Option 1 – Maven Wrapper:**
Open a terminal inside the IDE at the root of the backend project and execute
the Maven Wrapper command to resolve dependencies cleanly (bypassing global
path constraints):
```bash
# Windows
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw clean install
./mvnw spring-boot:run
```

**Option 2 – IDE (VS Code / Eclipse / IntelliJ):**
- Open `BackendApplication.java`
- Click the ▶ Run button above the `main` method.

The API will be available at: `http://localhost:8080`

### 4. Run the Application Frontend

1. Open a secondary terminal window and navigate to the root directory of the
frontend repository.
2. Install the required Node modules and reactive UI dependencies:
```
npm install
```
3. Boot the Angular development server:
```
ng serve
```
4. Upon successful compilation, open a web browser and navigate to http://localhost:4200
to interact with the UI.