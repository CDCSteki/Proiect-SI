# AutoService Backend API

Spring Boot REST API for the Auto Service Management Platform.

## Tech Stack
- Java 25 + Spring Boot 4.0.6
- Spring Security + JWT (JJWT 0.12.5)
- Hibernate / Spring Data JPA
- Neon Serverless PostgreSQL 17
- Maven

## Setup

1. Clone the repository
2. Create `src/main/resources/application.properties` with:
spring.datasource.url=jdbc:postgresql://<host>.neon.tech/<dbname>?sslmode=require
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
server.port=8080
jwt.secret=your_secret
jwt.expiration=86400000
3. Run the application:
**Option 1 – VS Code:**
- Open `BackendApplication.java`
- Click the ▶ Run button above the `main` method

**Option 2 – Command Prompt:**
cd path/to/project
mvn spring-boot:run

**Option 3 – Maven Wrapper:**
.\mvnw.cmd spring-boot:run
4. API available at: `http://localhost:8080`

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ✗ | Register new client |
| POST | /api/auth/login | ✗ | Login, returns JWT |

### Cars
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/cars | ✓ | Add a new car |
| GET | /api/cars/my | ✓ | Get my cars |
| DELETE | /api/cars/{id} | ✓ | Delete a car |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/appointments | ✓ | Book appointment |
| GET | /api/appointments/my | ✓ | Get my appointments |
| PATCH | /api/appointments/{id}/status | ✓ | Update status |
| PATCH | /api/appointments/{id}/assign | ✓ | Assign mechanic |
| DELETE | /api/appointments/{id} | ✓ | Cancel appointment |


## Git Workflow
- `main` – production
- `develop` – integration
- `feature/...` – one branch per user story