# Homelab Dashboard

A secure, premium, and customizable dashboard for your local home server. Built with Next.js 15, Tailwind CSS, and Framer Motion.

![Homelab Dashboard](https://github.com/user-attachments/assets/placeholder)

## Features

- 🚀 **Centralized Hub**: Single entry point for all your local services (Plex, Pi-hole, Portainer, etc.).
- 🎨 **Premium Design**: "Deep Space" theme with glassmorphism, animated backgrounds, and interactive hover effects.
- ⚡ **Real-time Monitoring**: Live system stats including CPU, RAM, Storage, and Uptime.
- 🛡️ **Resilient Configuration**: Fallback "Service Unavailable" pages for missing configurations.
- 🔒 **Secure Configuration**: Service URLs are configured via environment variables.
- 🛠 **Easy Customization**: Simple configuration file and component architecture.

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ChaitanyaDhiman/homelab-web.git
   cd homelab-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your services:
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to add your actual service URLs:
   ```env
   NEXT_PUBLIC_SERVICE_PLEX_URL=http://192.168.1.10:32400/web
   NEXT_PUBLIC_SERVICE_PIHOLE_URL=http://192.168.1.5/admin
   # ... add your specific IPs/Ports
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view your dashboard.

## Configuration

### Adding New Services

1. Add the environment variable in `.env.local`:
   ```env
   NEXT_PUBLIC_SERVICE_NEWAPP_URL=http://localhost:1234
   ```

2. Update `app/config/services.ts`:
   ```typescript
   import { Layout } from "lucide-react"; // Choose an icon

   export const services: Service[] = [
     // ... existing services
     {
       id: "new-app",
       name: "My New App",
       description: "Description of the app",
       url: process.env.NEXT_PUBLIC_SERVICE_NEWAPP_URL || "/unavailable?service=new-app",
       icon: Layout,
       category: "system", // 'media' | 'system' | 'dev' | 'network' | 'ai'
       status: "online",
     },
   ];
   ```

## Customization

- **Theme**: Edit variables in `app/globals.css` to change the color scheme.
- **Icons**: Uses [Lucide React](https://lucide.dev) for lightweight, consistent iconography.

## Deployment

This app is optimized for Docker or Vercel deployment.

### Docker (Recommended)

This project uses Docker Compose to run the dashboard alongside essential services like Nginx Proxy Manager, Portainer, and Pi-hole.

1. **Prerequisites**: Ensure Docker and Docker Compose are installed.
2. **Start Services**:
   ```bash
   docker compose up -d --build
   ```
   > **Note**: This starts the dashboard on port `9000` (internal) and Nginx Proxy Manager on ports `80`, `81` (Admin), and `443`.

3. **Secure Access (SSL)**:
   We recommend using Nginx Proxy Manager (included) to expose the dashboard securely.
   - **Admin UI**: [http://localhost:81](http://localhost:81) (Default login: `admin@example.com` / `changeme`)
   - **Proxy Host Setup**:
     1. Add a Proxy Host (e.g., `docker.mylocalserver.com`).
     2. Forward to `host.docker.internal` (or your server IP) on port `9000`.
     3. Enable **SSL** (supports Let's Encrypt or Self-Signed).
        - *Tip*: For local domains like `mylocalserver.com`, generate self-signed certs:
          ```bash
          openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout self-signed.key -out self-signed.crt -subj "/CN=docker.mylocalserver.com"
          ```
        - Upload these as a "Custom Certificate" in NPM.

### Manual / Vercel

Build and run the production server:
```bash
npm run build
npm start
```

## System Stats
The dashboard includes a real-time system monitor. 
- **CPU**: Shows usage load.
- **RAM**: Active memory usage.
- **Temp**: Average temperature of all CPU cores (falls back to Package temp if cores unavailable).
- **Storage**: Usage of the root `/` partition.

## License

MIT
