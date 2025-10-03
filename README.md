# AI Voice Bridge - Landing Page

A world-class, visually stunning website for AI Voice Bridge built with modern web technologies.

## 🚀 Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Cinematic animations and transitions
- **Three.js + React Three Fiber** - 3D graphics and visualizations
- **Supabase** - Backend as a Service (Auth + Database)

## ✨ Features

- 🎨 **Stunning 3D Hero Section** - Interactive 3D background with particle effects
- 🎭 **Smooth Animations** - Page transitions and scroll-triggered animations
- 🎮 **Interactive AI Playground** - Live demo chat interface
- 💎 **Glass Morphism Design** - Modern frosted glass effects
- 📱 **Fully Responsive** - Mobile-first design approach
- ⚡ **Performance Optimized** - Code splitting and lazy loading
- 🔒 **Authentication Ready** - Supabase integration for user management

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd Website
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` and add your Supabase credentials:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📦 Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme:
- **Primary colors**: Blue tones for main branding
- **Accent colors**: Purple/pink tones for highlights

### Animations

Modify animation timing and effects in `tailwind.config.ts` under `theme.extend.animation`.

### 3D Scene

Customize the 3D background in `components/Hero3D.tsx`:
- Adjust sphere distortion, colors, and rotation speed
- Modify particle count and behavior
- Change lighting and camera settings

## 📝 Project Structure

\`\`\`
Website/
├── app/                  # Next.js app directory
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── Hero3D.tsx      # 3D background component
│   ├── HeroSection.tsx # Landing hero section
│   ├── FeaturesSection.tsx
│   ├── AIPlayground.tsx
│   └── CTASection.tsx
├── lib/                # Utilities and helpers
│   └── supabase.ts    # Supabase client
├── public/            # Static assets
├── tailwind.config.ts # Tailwind configuration
├── tsconfig.json      # TypeScript configuration
└── next.config.js     # Next.js configuration
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🔐 Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Add them to `.env.local`
4. (Optional) Set up authentication providers in Supabase dashboard

## 📄 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and modern web technologies
