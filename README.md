# Investment Platform

A comprehensive investment platform built with Next.js, MongoDB, and Tailwind CSS that allows administrators to create and manage investment plans while users can invest and track their investments.

## Features

### Admin Features
- User management (create, edit, activate/deactivate)
- Investment plan creation and management
- Define flexible maturity periods and interest rate ranges
- Finalize plans with actual interest rates
- Payment receipt approval workflow
- Investment tracking and reporting

### User Features
- Secure authentication (email/password and Google OAuth)
- Browse available investment plans
- Purchase investment plans
- Upload payment receipts
- Track investment status and maturity progress
- View matured investments and credited interest

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Background Jobs**: node-cron

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB database
- Google OAuth credentials (for Google sign-in)
- SMTP server for email notifications

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/investment-platform.git
   cd investment-platform
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file based on `.env.example` and fill in your environment variables.

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin User

The application automatically creates a default admin user when the database is first connected:

- **Email**: admin@gmail.com
- **Password**: Mansir12

**Important**: For security reasons, you should change the default admin password after your first login.

### Initial Setup

1. **Login as Admin**: Use the default admin credentials to log in.

2. **Create Investment Plans**: Create investment plans with different maturity periods and interest rates.

3. **Register Users**: Add users who can then invest in your plans.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js (min 32 chars) |
| `NEXTAUTH_URL` | Base URL of your application |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `EMAIL_HOST` | SMTP server host |
| `EMAIL_PORT` | SMTP server port |
| `EMAIL_SECURE` | Use TLS for SMTP (true/false) |
| `EMAIL_USER` | SMTP server username |
| `EMAIL_PASSWORD` | SMTP server password |
| `EMAIL_FROM` | Email sender address |

## Investment Lifecycle

The platform uses a status-based system for investment lifecycles:

1. **pending_payment**: User has selected a plan but hasn't made payment yet
2. **awaiting_approval**: User has uploaded payment receipt, waiting for admin approval
3. **active**: Payment approved, investment is active and counting toward maturity
4. **matured**: Investment has reached maturity date, admin needs to finalize interest rate
5. **completed**: Final amount has been credited to user

## Deployment

This application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Configure the environment variables
4. Deploy

## License

[MIT](LICENSE)

## Support

For support, email support@yourplatform.com or open an issue in the GitHub repository.
\`\`\`

Since we're now handling the seeding directly in the database connection, we can remove the API route and the call in the layout file:

```js file="app/api/seed/route.js"
// This file can be removed as we're now seeding in the db.js file
