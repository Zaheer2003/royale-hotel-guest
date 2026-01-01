# Royale Hotel - Guest Module Setup

This documentation provides steps to set up and run the Guest module of the Royale Hotel Management System.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

## Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/Zaheer2003/royale-hotel-guest.git
    cd royale-hotel-guest
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    npm install --legacy-peer-deps
    ```
    (Use `--legacy-peer-deps` if you encounter dependency conflicts)

## Environment Configuration

1.  Create a `.env` file in the root directory.
2.  Add the following environment variables (you will need to obtain the actual API keys):

    ```env
    # Database (SQLite)
    DATABASE_URL="file:./dev.db"

    # NextAuth Authentication
    AUTH_SECRET="your_generated_secret_here" # Run `npx auth secret` to generate
    AUTH_GOOGLE_ID="your_google_client_id"
    AUTH_GOOGLE_SECRET="your_google_client_secret"

    # App URL
    NEXTAUTH_URL="http://localhost:3000"
    ```

## Database Setup

This project uses **Prisma** with **SQLite**.

1.  **Generate the Prisma Client**:
    ```bash
    npx prisma generate
    ```

2.  **Push the schema to the database**:
    ```bash
    npx prisma db push
    ```
    This creates the `dev.db` file and sets up the tables.

## Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components.
- `prisma/`: Database schema and configuration.
- `public/`: Static assets.

## Troubleshooting

- **Authentication Errors**: Ensure `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` are correctly set in `.env`.
- **Database Errors**: Try deleting `prisma/dev.db` and running `npx prisma db push` again if the schema gets out of sync.
