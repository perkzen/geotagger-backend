# Geotagger Backend

Geotagger backend is a RESTful API that handles user authentication, image uploads, location guessing, and point
management. It also logs user interactions for administrative oversight.

## Features

- **User Authentication**:
    - JWT token-based authentication for secure user sessions.
    - OAuth integration (Google and Facebook) for user login and registration.
    - Password reset functionality (with reset token sent via email).

- **Location and Image Management**:
    - Users can upload images and tag the exact location on a map.
    - Each location is stored with its latitude and longitude in the database.

- **Guessing Game with Points System**:
    - Users guess the location of uploaded images by placing a pin on the map.
    - Points are deducted based on the number of guesses (1 point for the first, 2 for the second, 3 for all subsequent
      guesses).
    - Distance error is calculated to determine how close the guess is to the real location.

- **Logging User Actions**:
    - Tracks user actions such as clicks, scrolls, and input changes.
    - Stores this data in the database to help monitor user behavior and interactions.

- **Error Handling and Logging**:
    - General error handling is implemented to catch and log issues with the API.

## Technologies Used

- **Backend Framework**: NestJS (with Express)
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) and OAuth (Google, Facebook)
- **File Storage**: Amazon S3 for image storage
- **Testing**: Jest for unit and end-to-end testing
- **Logging**: Winston for logging user actions and errors
- **Queue Management**: Bull for handling background jobs
- **API Documentation**: Swagger for API documentation
- **Deployment**: Docker for containerization, AWS for deployment
- **Webhooks**: AWS SNS for notifications
- **Email Service**: Resend for sending password reset emails

## Prerequisites

- **Node.js** 20+
- **Docker** (for containerization and local environment setup)
- **AWS Account** (for S3 image storage and deployment)
- **PostgreSQL** (local database for development or AWS RDS for production)
- **Google API Key** (for Google Maps integration)
- **Facebook App ID** (for Facebook login integration)
- **Email Service** (for sending password reset emails)

## Setup Instructions

### 1. Install Dependencies

In the backend directory, run the following command to install all the required dependencies:

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```env
NODE_ENV=development
PORT=8000

FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://admin:admin@localhost:5432/geotagger?schema=public
JWT_SECRET=
JWT_ACCESS_TOKEN_EXPIRATION_TIME=1d
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d

REDIS_URL=redis://localhost:6379

BULL_BOARD_USERNAME=
BULL_BOARD_PASSWORD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GOOGLE_MAPS_API_KEY=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_S3_REGION=


RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

### 3. Setup Database

Run the Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

Push database schema to the database:

```bash
npx prisma db push
```

### 4. Run the Development Server

Start the backend development server:

```bash
npm run start:dev
```

The server will be running on [http://localhost:8000](http://localhost:8000).

### 5. Swagger API Documentation

Once the server is running, you can access the API documentation
at [http://localhost:8000/docs](http://localhost:8000/docs). Swagger will display the list of available endpoints, their
parameters, and responses.
