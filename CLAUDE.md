# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoiceBridge AI is a modern landing page for an AI voice call center solution. Built with Next.js 15, TypeScript, and Tailwind CSS, featuring interactive 3D elements, smooth animations, and a live AI playground demo.

## Development Commands

```bash
# Start development server (default port: 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Stack
- **Next.js 15** with App Router (app directory structure)
- **TypeScript** with strict mode enabled
- **Tailwind CSS** with custom theme configuration
- **Framer Motion** for animations
- **React Three Fiber + Three.js** for 3D graphics (currently simplified)
- **Supabase** for authentication and backend services

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components (all client components use 'use client')
- `lib/` - Utility functions and service integrations (e.g., Supabase client)
- `public/` - Static assets

### Component Architecture
All major sections are separate components imported into the main page:
- `Navigation` - Top navigation bar
- `HeroSection` - Landing section with 3D background
- `FeaturesSection` - Feature showcase
- `AIPlayground` - Interactive chat demo
- `CTASection` - Call-to-action section
- `Footer` - Bottom footer

The main page (`app/page.tsx`) assembles these components in order.

### Styling System
- Custom Tailwind theme with brand colors defined in `tailwind.config.ts`
  - `primary`: Cyan/turquoise tones (matching VB logo - #06b6d4 base)
  - `accent`: Teal tones for complementary highlights (#14b8a6 base)
- Custom utility classes in `app/globals.css`:
  - `.text-gradient` - Gradient text effect
  - `.glow-effect` - Drop shadow glow
  - `.glass-morphism` - Frosted glass background
- Custom animations defined in Tailwind config (float, glow, slide-up, fade-in)
- Logo: `public/logo.png` - VB logo with transparent background (also available as `logo.jpg`)

### State Management
- Client components use React hooks (useState, useRef)
- Framer Motion's `useInView` hook for scroll-triggered animations
- No global state management library (Redux, Zustand) currently used

### Authentication
Supabase integration is set up in `lib/supabase.ts` with helper functions:
- `authHelpers.signUp()`
- `authHelpers.signIn()`
- `authHelpers.signOut()`
- `authHelpers.getCurrentUser()`

Environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3D Graphics
The `Hero3D.tsx` component is currently simplified (using gradient background). The full Three.js implementation has been temporarily removed. When implementing 3D features:
- Use React Three Fiber's Canvas component
- Keep 3D scene within client components
- Optimize for performance with appropriate geometry complexity

## Important Patterns

### Client vs Server Components
- All components with interactivity, animations, or hooks must use `'use client'` directive
- Layout and metadata handling happens in server components
- Current implementation: most components are client-side due to Framer Motion usage

### TypeScript Configuration
- Strict mode enabled
- Path alias `@/*` maps to project root
- Target: ES2017
- Module resolution: bundler

### Animation Patterns
- Use Framer Motion's `motion` components for animations
- Implement scroll-triggered animations with `useInView` hook
- Common pattern: `initial`, `animate`, `transition` props

### Responsive Design
- Mobile-first approach with Tailwind breakpoints (sm, md, lg)
- Test on various screen sizes as components are visually complex

## Deployment

### Git & GitHub
- Repository: https://github.com/bgash22/voicebridge-ai-website
- GitHub account: bgash22
- Main branch: `main`
- GitHub CLI authenticated and ready to use

### Vercel (Production)
- Live URL: https://voicebridge-m5nuewcc5-bader-alshehris-projects.vercel.app
- Dashboard: https://vercel.com/bader-alshehris-projects/voicebridge-ai
- Vercel CLI installed and authenticated
- Auto-deploys on push to main branch
- Connected to GitHub repository

### Deployment Commands
```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel inspect

# View logs
vercel logs
```

## Development Notes

### Known Issues
- Hero3D component is currently simplified (3D background disabled)
- AIPlayground uses mock responses, not connected to real AI API

### Recent Changes
- Fixed CSS errors in `app/globals.css` (removed invalid Tailwind classes)
- Added VB logo (`public/logo.png` with transparent background)
- Updated color theme to cyan/teal to match brand logo
- Deployed to Vercel and connected to GitHub

### Future Considerations
- OpenAI API integration for live AI responses (env var: `OPENAI_API_KEY`)
- Restore full Three.js 3D implementation in Hero3D
- Add user authentication flows with Supabase
- Consider custom domain (e.g., voicebridge.ai)

### Performance
- Next.js handles code splitting automatically
- Images should use Next.js Image component for optimization
- Consider lazy loading heavy 3D components when restored
