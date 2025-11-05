# Introduction Bookverse:
- Bookverse is an online bookstore web application built with a modern full-stack architecture.
- It provides a smooth browsing and purchasing experience for users while maintaining a clean and maintainable backend.

# Tech Stack
## Frontend
- React.js 
- TailwindCSS / Bootstrap (if applicable for styling)
- TypeScript

## Backend
- Spring Boot (REST API) - Java 21 SDK
- Swagger (API documentation)
- Postman (API testing)
## Database
- MySQL 8 (running inside Docker)
- Managed with MySQL Workbench / JetBrains DataGrip

# Tools & Utilities
- IntelliJ Ultimate (IDE)
- DataGrip and MySQL Workbench (DBMS)
- Docker (containerization)
- Git & GitHub (version control)
- Maven (dependency management)

# Features
- User authentication and authorization
- Browse, search, and filter books
- Add to cart and place orders
- Admin panel for managing books and inventory
- API documentation with Swagger UI
- REST API testing with Postman

# Authentication Roles
- Guest: Can sign up, verify email, reset password
- Customer: Can sign in, verify email, reset password, log out
- Staff: Same as customer + manage users (update, view list)
- Admin: Full access (create, update, delete users, assign roles)

# API Documentation
- Swagger UI: http://localhost:8080/bookverse/docs
- Postman Collection: (Add link if you export one)

# Testing
- Backend unit tests with JUnit
- Manual API testing with Postman
- UI testing with React Testing Library (optional)

# Contributing
- Contributions, issues, and feature requests are welcome!
- Feel free to open a PR or submit an issue.

# License
This project is licensed under the MIT License – see the LICENSE.md file for details.

⚡ Developed with ❤️ using Spring Boot, React, Docker, IntelliJ, DataGrip and MySQL
