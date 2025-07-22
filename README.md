# Sunday School Management System Monorepo

This repository hosts both the back-end API and the front-end client for the Sunday School Management System. It uses **pnpm** workspaces to manage dependencies for the separate apps.

## Repository Structure

```
CNM-Sunday-school-site/
├── apps/
│   ├── client/  # React + Vite front-end
│   └── server/  # Express back-end
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

- **apps/client** – Vite/React project located at `apps/client`
- **apps/server** – Express API located at `apps/server`

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager

Install pnpm globally if it is not already installed:

```bash
npm install -g pnpm
```

Install all workspace dependencies:

```bash
pnpm install
```

## Starting the Applications

### Server

Run the development server from the repository root:

```bash
pnpm --filter server dev
```

For a production build you can start the compiled server with:

```bash
pnpm --filter server start
```

### Client

Start the Vite development server:

```bash
pnpm --filter client dev
```

After building the client you can preview it using:

```bash
pnpm --filter client preview
```

## Environment Variables

### Server (`apps/server/.env`)
Create an `.env` file in `apps/server` and provide the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173 # URL where the client is served
PORT=5000                       # Optional – default is 5000
NODE_ENV=development            # Optional
```

### Client (`apps/client/.env`)
Create an `.env` file in `apps/client` with:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Adjust the values to match your server configuration when deploying.

## Running Tests

Workspace packages can expose a `test` script. Run the tests from the repository root with:

```bash
pnpm test
```

The current packages do not include automated tests yet, so this command will simply display the default placeholder message until tests are added.

## Useful Commands

- Build client: `pnpm --filter client build`
- Install new dependency for a package: `pnpm --filter <pkg> add <dep>`

