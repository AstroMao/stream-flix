# Stream-Flex: Full-Stack Media Streaming Platform

Stream-Flex is a modern, full-stack media streaming application designed for managing and viewing a personal library of movies, series, and advertisements. It features a sleek, responsive frontend built with React and Vite, a powerful backend service powered by Node.js and Fastify, and utilizes PocketBase as an all-in-one backend for database, auth, and file storage.

## ✨ Features

- **Dynamic Content Library**: Browse and play movies, series, and ads
- **PocketBase Integration**: Leverages PocketBase for database, user authentication, and real-time updates
- **TMDB Enrichment**: An admin panel to search for and link media with rich metadata and artwork from The Movie Database (TMDB)
- **Node.js Backend Scanner**: A dedicated Node.js service to automatically scan media directories, and create, update, or delete database records
- **API-Driven Control**: The frontend can trigger backend processes like a media scan on demand
- **Secure HLS Streaming**: Media is served via Nginx with referer checks to prevent unauthorized embedding
- **Centralized Configuration**: A single `.env` file at the project root manages configuration for the entire stack

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend Service**: Node.js, Fastify
- **Database & Auth**: PocketBase
- **Web Server / Reverse Proxy**: Nginx
- **Video Playback**: Video.js

## 📂 Project Structure

The project is organized into a monorepo-style structure to keep the frontend, backend, and other services cleanly separated.

```
/stream-flex-project/
|
|-- client/           # React frontend application (Vite)
|-- server/           # Node.js backend service (Fastify)
|-- media/            # (Mounted Volume) Root directory for all media files
|-- nginx/            # Nginx configuration files
|-- pocketbase/       # PocketBase data and executable
|-- .env              # Root configuration for all services
`-- docker-compose.yml  # (Optional) For orchestrating all services
```

## ⚙️ Setup and Installation

Follow these steps to get the project running locally.

### 1. Prerequisites

- Node.js (v16 or higher)
- npm
- Nginx
- PocketBase

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd stream-flex-project
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project directory. This file will hold all your secret keys and configuration variables.

```env
# PocketBase and Server Configuration
POCKETBASE_URL="http://127.0.0.1:8090"
POCKETBASE_ADMIN_EMAIL="your_admin_email@example.com"
POCKETBASE_ADMIN_PASSWORD="your_admin_password"
SERVER_PORT=3001

# Vite Client-Side Configuration (must be prefixed with VITE_)
VITE_POCKETBASE_URL="http://127.0.0.1:8090"
VITE_TMDB_API_KEY="your_tmdb_api_key_here"

# Media Paths (used by the Node.js scanner)
MOVIES_ROOT=/path/to/your/media/movies
SERIES_ROOT=/path/to/your/media/series
ADS_ROOT=/path/to/your/media/ads
```

**Note**: Replace placeholder values with your actual data.

### 4. Install Dependencies

You need to install dependencies for both the client and the server.

**Install Client Dependencies:**
```bash
cd client
npm install
cd ..
```

**Install Server Dependencies:**
```bash
cd server
npm install
cd ..
```

## ▶️ Running the Application

You will need to run each service in a separate terminal window.

### Start PocketBase:
Navigate to your `pocketbase/` directory and run the executable:
```bash
./pocketbase serve
```

### Start the Node.js Backend Server:
This server handles API requests from the frontend, such as triggering a media scan.
```bash
cd server
npm run dev
```
The server will start on the port defined in your `.env` file (defaults to 3001).

### Start the React Frontend (Vite Dev Server):
This serves your React application with hot-reloading for development.
```bash
cd client
npm run dev
```

### Start Nginx:
Ensure your Nginx server is running and loaded with the project's configuration file. The provided `nginx.conf` is set up to:
- Serve the React app
- Proxy `/api/` requests to PocketBase
- Proxy `/server-api/` requests to your Node.js server
- Serve HLS streams from your `/media` directory

## 📜 Available Scripts

### Client (`client/package.json`)
- `npm run dev`: Starts the Vite development server for the frontend
- `npm run build`: Builds the React application for production
- `npm run preview`: Serves the production build locally for testing

### Server (`server/package.json`)
- `npm run dev`: Starts the Node.js server with `--watch` flag for automatic restarts on file changes
- `npm run start`: Starts the Node.js server for production use

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.