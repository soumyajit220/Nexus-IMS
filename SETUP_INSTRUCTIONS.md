# Setup Instructions

Since Node.js and NPM could not be detected in the environment, the project structure has been created manually.
Please follow these steps to install dependencies and run the project **if you have Node.js installed locally OR when you move this to an environment with Node.js**.

## Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or a Cloud URI)

## Backend Setup
1. Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the server:
    ```bash
    npm run dev
    ```
    (Ensure MongoDB is running locally at `mongodb://localhost:27017` or update `.env`)

## Frontend Setup
1. Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

## Notes
- The backend runs on Port 5000.
- The frontend runs on Port 5173 (usually).
