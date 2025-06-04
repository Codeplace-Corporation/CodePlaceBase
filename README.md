# CodePlace

CodePlace is a web marketplace that connects clients with freelance software developers. It provides tools for posting jobs, searching for projects, and managing work from start to finish. The project is built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase** and includes a small Firebase Cloud Function for Stripe payments.

## Features

- **Landing and About pages** that introduce the platform and allow users to join a waitlist.
- **Authentication** using Firebase, with sign-up and login pages.
- **Job search** interface for browsing job posts, filtering by type, category, tools, and compensation.
- **Dashboard** for developers to view active jobs, job recommendations, and upcoming deadlines.
- **Messaging** area to communicate about projects.
- **Stripe integration** via a Firebase Cloud Function to handle checkout sessions for paid job posts.

## Project Structure

- `src/` – React application source
  - `pages/` – routes such as `landing`, `dashboard`, `jobSearch`, and `auth`
  - `components/` – reusable UI components and styled elements
  - `context/` and `hooks/` – authentication context and custom hooks
- `functions/` – Firebase Cloud Function code for Stripe checkout

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Build for production:
   ```bash
   npm run build
   ```

To configure Firebase, update `src/firebase.js` with your own project credentials. The Cloud Function for Stripe requires the `stripe.secret_key` to be set in Firebase functions config.

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)

