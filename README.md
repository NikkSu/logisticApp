# Order Management System

## Project Overview

This project is a backend-oriented system for managing product orders and tracking them across multiple suppliers.

The main goal of the project is to simplify the process of creating orders, processing them by suppliers, and tracking their current status.  
The system also provides basic analytics to monitor order flow and supplier activity.

This project was created as a learning (course) project to practice backend development, security, and REST API design.

---

## Project Purpose

The purpose of this project is to demonstrate:

- Backend development using Spring Boot
- REST API design
- Authentication and authorization with JWT
- OAuth integration (Google, Discord)
- Role-based access control
- Work with relational databases

---

## System Description

The system supports three main user roles:

- **Client**
  - Creates product orders
  - Tracks order status

- **Supplier**
  - Views assigned orders
  - Updates order status

- **Admin**
  - Performs CRUD operations on system entities
  - Manages users, orders, and suppliers

The supplier is implemented as a **system role inside the backend**, not as a separate external REST service.  
All business logic is handled within a single backend application.

---

## Key Features

- User registration and authentication
- Secure authorization using JWT
- OAuth login (Google, Discord)
- Order creation and tracking
- Supplier order processing
- Admin CRUD functionality
- Role-based access control
- Basic analytics for orders and suppliers

---

## Technologies Used

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- OAuth 2.0 (Google, Discord)
- REST API
- MySQL

### Frontend
- React


## Project Structure

