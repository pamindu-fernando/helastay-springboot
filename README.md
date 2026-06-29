# Helastay 🇱🇰

Helastay is a full-stack property rental application developed with Java and Spring Boot. It provides a secure platform for users to browse listings, make bookings, leave reviews, and manage their profiles.

## Technologies Used

*   **Backend:** Java 21, Spring Boot, Spring Security, Spring Data JPA
*   **Database:** H2 (Local Development), MySQL (Production)
*   **Frontend:** HTML, CSS, Vanilla JavaScript (served via Spring Boot static resources)
*   **Security:** BCrypt Password Hashing, Session-based Authentication (JDBC Store)
*   **Build Tool:** Maven

## Features

*   **User Authentication:** Secure registration and login using Spring Security and BCrypt.
*   **Property Listings:** Browse, view details, and manage accommodation listings.
*   **Booking System:** Reserve stays at properties.
*   **Review System:** Leave feedback and ratings for previous stays.
*   **File Management:** Upload and serve images for property listings and user profiles.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

*   Java Development Kit (JDK) 21 or higher
*   Maven 3.6+
*   Git

## Local Development Setup

Follow these steps to get the application running locally.

1.  **Clone the repository**
    ```bash
    git clone <your-repository-url>
    cd staybnb/backend
    ```

2.  **Build the project**
    Navigate to the `backend` directory where the `pom.xml` file is located and run:
    ```bash
    mvn clean install
    ```

3.  **Run the application**
    ```bash
    mvn spring-boot:run
    ```

4.  **Access the application**
    Open a web browser and navigate to:
    `http://localhost:8080`

### Local Database Configuration

By default, the application runs using the `default` profile, which utilizes an embedded H2 database. Data is stored locally in the `./data/staybnbdb` directory.

To access the H2 Database Console:
*   **URL:** `http://localhost:8080/h2-console`
*   **JDBC URL:** `jdbc:h2:file:./data/staybnbdb`
*   **Username:** `sa`
*   **Password:** *(leave blank)*

## Production Deployment

The application includes a `prod` profile configured for production environments using MySQL.

### Production Prerequisites
*   Ubuntu Server (or similar Linux distribution)
*   MySQL Server 8.0+

### Deployment Steps
1. Configure your MySQL database with the credentials specified in `src/main/resources/application.properties` under the `prod` profile.
2. Package the application:
   ```bash
   mvn clean package -DskipTests
   ```
3. Run the packaged JAR with the production profile active:
   ```bash
   java -jar -Dspring.profiles.active=prod target/staybnb-backend-1.0.0.jar
   ```

*(Note: If utilizing the provided deployment scripts on an Azure Ubuntu VM, refer to `deploy-mysql.sh` for automated environment provisioning and service configuration.)*

## Project Structure

*   `backend/src/main/java/com/staybnb/`: Contains the backend Java source code (Controllers, Services, Models, Repositories, Security Configurations).
*   `backend/src/main/resources/`: Contains the application configuration (`application.properties`) and database seed files (`data.sql`).
*   `backend/src/main/resources/static/`: Contains the frontend UI pages and assets (HTML, CSS, JavaScript, Images).
*   `backend/uploads/`: Directory used for storing user-uploaded media files.
