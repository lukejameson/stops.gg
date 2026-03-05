# Deployment Guide

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   # Edit .env and set your DOMAIN
   ```

2. **Build and run:**
   ```bash
   # With Traefik (for SSL/HTTPS)
   docker-compose up -d
   
   # Or without Traefik (direct port access)
   docker run -p 8080:80 stops-gg:test
   ```

## Using Traefik (Recommended for Production)

The docker-compose.yml assumes you have Traefik running as a reverse proxy. It will automatically handle SSL certificates via Let's Encrypt.

### Prerequisites:
- Docker network named `web`:
  ```bash
  docker network create web
  ```
- Traefik running with the `web` network

### Deploy:
```bash
docker-compose up -d
```

## Without Traefik (Simple Hosting)

If you don't want to use Traefik, you can run the container directly:

```bash
# Build
docker build -t stops-gg .

# Run on port 8080
docker run -d -p 8080:80 --name stops-gg stops-gg
```

Or use a simple docker-compose without Traefik labels:

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DOMAIN` | Yes | `stops.gg` | Domain for SSL certificate |

## Files Structure

The Docker image serves these static files:
- `index.html` - Main entry point
- `styles.css` - Stylesheet
- `app.js` - Main application logic
- `utils/` - Utility modules
- `data/` - Data loading modules
- `search/` - Search functionality
- `ui/` - UI rendering modules
- `timetables.json` - Bus timetable data
