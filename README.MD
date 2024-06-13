# Sports Facility Booking Platform

## Project Overview

The Sports Facility Booking Platform is designed to simplify the process of booking sports facilities. This backend application, built using TypeScript, Express.js, and Mongoose, supports essential functionalities like CRUD operations, authentication & authorization, and transaction management.

## Features

- **User Authentication & Authorization**:
  - User Sign-Up
  - User Login
  - Role-based Access Control (Admin and User)
- **Facility Management**:
  - Create, Update, and Soft Delete Facilities (Admin Only)
  - Retrieve All Facilities
- **Booking Management**:
  - Check Availability of Facilities
  - Create Bookings (User Only)
  - View All Bookings (Admin Only)
  - View User-specific Bookings (User Only)
  - Cancel Bookings (User Only)
- **Error Handling**:
  - Comprehensive Error Responses
  - Global Error Handling Middleware
- **Validation**:
  - Input validation using Zod
- **Miscellaneous**:
  - Not Found Route Handler
  - Secure Password Handling (Hashing)
  - Transaction & Rollback for Critical Operations

## Technology Stack

- **Programming Language**: TypeScript
- **Web Framework**: Express.js
- **ODM & Validation Library**: Mongoose for MongoDB
- **Validation Library**: Zod

## Live Server

The application is deployed and can be accessed at: [Live Server URL](https://sport-ease-backend.vercel.app/api/facility)

## Setting Up and Using the Application

### Prerequisites

- Node.js (>=14.x)
- npm or yarn
- MongoDB

### Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/yasin-arafat-389/SportEase-Backend
   ```

2. **Install dependencies**:

   ```sh
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following variables:

   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=your mongodb URI
   SALT_ROUND=JWT salt round
   JWT_ACESS_TOKEN_SECRET=your JWT access token secret
   ACCESS_TOKEN_EXPIRES_IN=1d
   ```

4. **Run the application**:
   ```sh
   npm run start:dev
   ```

### Usage

Once the server is running, you can use the following endpoints:

### API Endpoints

1. **User Sign Up**

- **Route**: `POST /api/auth/signup`

2. **User Login**

- **Route**: `POST /api/auth/login`

3. **Create a Facility (Admin Only)**

- **Route**: `POST /api/facility`

4. **Update a Facility (Admin Only)**

- **Route**: `PUT /api/facility/:id`

5. **Delete a Facility - Soft Delete (Admin Only)**

- **Route**: `DELETE /api/facility/:id`

6. **Get All Facilities**

- **Route**: `GET /api/facility`

7. **Check Availability**

- **Route**: `GET /api/check-availability?date=15-06-2024`

8. **Create a Booking (User Only)**

- **Route**: `POST /api/bookings`

9. **View All Bookings (Admin Only)**

- **Route**: `GET /api/bookings`

10. **View All Bookings (Admin Only)**

- **Route**: `GET /api/bookings/user`

11. **Cancel a Booking (User Only)**

- **Route**: `DELETE /api/bookings/:id`
