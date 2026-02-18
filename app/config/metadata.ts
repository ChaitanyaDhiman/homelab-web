
export const metadata = {
    appName: 'NexLab',
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    description: 'A modern, customizable, and privacy-focused dashboard for your homelab services. Monitor systems, manage Docker containers, and access your apps with a beautiful glassmorphism interface.',
    author: {
        name: 'Chaitanya Dhiman',
        url: 'https://github.com/chaitanyadhiman',
        email: 'imcdhiman23@gmail.com'
    },
    links: {
        github: process.env.NEXT_PUBLIC_GIT_URL,
        documentation: process.env.NEXT_PUBLIC_GIT_URL + '#readme',
        issues: process.env.NEXT_PUBLIC_GIT_URL + '/issues'
    },
    license: 'MIT',
    year: new Date().getFullYear(),
    techStack: [
        { name: 'Next.js', url: 'https://nextjs.org/' },
        { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
        { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
        { name: 'Framer Motion', url: 'https://www.framer.com/motion/' },
        { name: 'Lucide Icons', url: 'https://lucide.dev/' },
        { name: 'Socket.io', url: 'https://socket.io/' },
    ]
};
