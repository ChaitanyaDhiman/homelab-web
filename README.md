# Homelab Dashboard

A secure, premium, and customizable dashboard for your local home server. Built with Next.js 15, Tailwind CSS, and Framer Motion.

![Homelab Dashboard](https://github.com/user-attachments/assets/placeholder)

## Features

- 🚀 **Centralized Hub**: Single entry point for all your local services (Plex, Pi-hole, Portainer, etc.).
- 🎨 **Premium Design**: "Deep Space" theme with glassmorphism, animated backgrounds, and interactive hover effects.
- ⚡ **Fast & Responsive**: Built on Next.js App Router for optimal performance.
- 🔒 **Secure Configuration**: Service URLs are configured via environment variables, keeping your local network topology private.
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
       url: process.env.NEXT_PUBLIC_SERVICE_NEWAPP_URL || "#",
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

### Docker (Coming Soon)
Dockerfile implementation is planned for containerized deployment.

## License

MIT
