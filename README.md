# Homelab Dashboard

A secure, premium, and customizable dashboard for your local home server. Built with Next.js 15, React 19, Tailwind CSS 4, and Framer Motion.

![Homelab Dashboard](https://github.com/user-attachments/assets/placeholder)

## ✨ Features

- 🚀 **Centralized Hub**: Single entry point for all your local services (Plex, Pi-hole, Portainer, Open WebUI, etc.)
- 🎨 **Premium Design**: "Deep Space" theme with glassmorphism, animated backgrounds, and interactive hover effects
- ⚡ **Real-time Monitoring**: Live system stats including CPU, RAM, Storage, and Temperature
- 🖥️ **Integrated Terminal**: Built-in web terminal with xterm.js for server management
- 🐳 **Docker Integration**: Includes Docker Compose setup for essential homelab services
- 🛡️ **Resilient Configuration**: Fallback "Service Unavailable" pages for missing configurations
- 🔒 **Secure Configuration**: Service URLs configured via environment variables
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🛠️ **Easy Customization**: Simple configuration file and component architecture

## 📦 What's Included

This project includes two main components:

1. **Next.js Dashboard** - The web interface for monitoring and accessing your services
2. **Docker Services** - Pre-configured Docker Compose setup for essential homelab services

### Included Services

- **Nginx Proxy Manager** - Reverse proxy with SSL/TLS management
- **Pi-hole** - Network-wide ad blocking and DNS server
- **Open WebUI** - Web interface for AI/LLM interactions
- **Portainer** - Docker container management UI
- **Plex Media Server** - Media streaming server

See the [docker-services README](./docker-services/README.md) for detailed documentation on these services.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Docker** and **Docker Compose** (for running services)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ChaitanyaDhiman/homelab-web.git
   cd homelab-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your services**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` to add your service URLs:
   ```env
   NEXT_PUBLIC_SERVICE_PLEX_URL=http://192.168.1.10:32400/web
   NEXT_PUBLIC_SERVICE_PIHOLE_URL=http://192.168.1.5/admin
   NEXT_PUBLIC_SERVICE_PORTAINER_URL=http://192.168.1.5:9443
   # ... add your specific IPs/Ports
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view your dashboard.

## 🐳 Docker Deployment

### Option 1: Dashboard Only

Deploy just the Next.js dashboard:

```bash
docker-compose up -d --build
```

The dashboard will be available on port `3000` (internal, exposed via proxy).

### Option 2: Full Stack (Dashboard + Services)

Deploy the dashboard along with all homelab services:

1. **Start the dashboard**:
   ```bash
   docker-compose up -d --build
   ```

2. **Start the services**:
   ```bash
   cd docker-services
   docker-compose up -d
   ```

3. **Configure Nginx Proxy Manager**:
   - Access admin UI at `http://localhost:82`
   - Default credentials: `admin@example.com` / `changeme`
   - Set up proxy hosts for your services (see [docker-services README](./docker-services/README.md))

### SSL/TLS Configuration

For secure access with HTTPS:

1. **Using Let's Encrypt** (for public domains):
   - Configure in Nginx Proxy Manager UI
   - Automatic certificate renewal

2. **Using Self-Signed Certificates** (for local domains):
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout self-signed.key -out self-signed.crt \
     -subj "/CN=docker.mylocalserver.com"
   ```
   Upload as "Custom Certificate" in Nginx Proxy Manager.

## 📁 Project Structure

```
homelab-web/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── system/          # System stats endpoint
│   │   └── terminal/        # Terminal WebSocket handler
│   ├── config/              # Configuration files
│   │   └── services.ts      # Service definitions
│   ├── unavailable/         # Service unavailable page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── dashboard/          # Dashboard-specific components
│   ├── terminal/           # Terminal component
│   └── ui/                 # Reusable UI components
├── docker-services/        # Docker services configuration
│   ├── docker-compose.yml  # Services compose file
│   └── README.md           # Services documentation
├── public/                 # Static assets
├── docker-compose.yml      # Dashboard compose file
├── Dockerfile              # Dashboard container image
├── .env.example            # Environment variables template
└── README.md               # This file
```

## ⚙️ Configuration

### Adding New Services

1. **Add environment variable** in `.env.local`:
   ```env
   NEXT_PUBLIC_SERVICE_NEWAPP_URL=http://localhost:1234
   ```

2. **Update service configuration** in `app/config/services.ts`:
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

### Customizing the Theme

Edit CSS variables in `app/globals.css`:

```css
:root {
  --primary: #your-color;
  --secondary: #your-color;
  /* ... other variables */
}
```

The dashboard uses [Lucide React](https://lucide.dev) for icons - browse their library to find the perfect icon for your services.

## 📊 System Monitoring

The dashboard includes real-time system monitoring:

- **CPU**: Current usage percentage and load average
- **RAM**: Active memory usage with total available
- **Temperature**: Average temperature of all CPU cores (falls back to package temp if unavailable)
- **Storage**: Usage of the root `/` partition
- **Uptime**: System uptime in human-readable format

System stats are fetched from the `/api/system` endpoint using the `systeminformation` library.

## 🖥️ Web Terminal

Access your server's terminal directly from the browser:

- Built with xterm.js and node-pty
- Real-time WebSocket connection
- Full terminal emulation support
- Secure access through the dashboard

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server (port 9000)
npm run lint     # Run ESLint
```

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Terminal**: xterm.js + node-pty
- **System Info**: systeminformation
- **TypeScript**: Full type safety

## 🔒 Security Best Practices

- Change all default passwords immediately after deployment
- Use SSL/TLS certificates for all services
- Restrict access to admin interfaces
- Keep all services updated regularly
- Use strong passwords and consider implementing authentication
- Review Pi-hole logs for suspicious DNS queries
- Limit external access to services that don't need it

## 🐛 Troubleshooting

### Dashboard Won't Start

```bash
# Check logs
docker-compose logs nextjs-dashboard

# Rebuild container
docker-compose up -d --build --force-recreate
```

### Services Not Accessible

- Verify service URLs in `.env.local`
- Check that services are running: `docker ps`
- Ensure network connectivity between containers
- Check Nginx Proxy Manager configuration

### System Stats Not Loading

- Ensure the dashboard has proper permissions to read system info
- Check `/api/system` endpoint in browser DevTools
- Verify `systeminformation` package is installed

### Terminal Not Working

- Check WebSocket connection in browser DevTools
- Ensure node-pty is properly installed
- Verify terminal permissions on the host system

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Docker Services Documentation](./docker-services/README.md)
- [Nginx Proxy Manager Guide](https://nginxproxymanager.com/guide/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own homelab!

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the homelab community
- Icons by [Lucide](https://lucide.dev)

---

**Made with ❤️ for homelabbers**
