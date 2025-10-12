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
  - `api/` - API routes (chat, speech transcription, speech synthesis, functions)
- `components/` - Reusable React components (all client components use 'use client')
- `lib/` - Utility functions and service integrations
  - `LanguageContext.tsx` - Language state management
  - `translations/` - Translation files for all supported languages (en, ar, es, fr, zh)
  - `supabase.ts` - Supabase client configuration
- `public/` - Static assets (logo, images)

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
- React Context API for language state management (see Internationalization below)
- No global state management library (Redux, Zustand) currently used

### Internationalization (i18n)

**Supported Languages**: English (EN), Arabic (AR), Spanish (ES), French (FR), Chinese (ZH)

The application uses React Context API for managing language state and translations across all components.

#### Architecture Overview

```
lib/
├── LanguageContext.tsx          # Language context provider & hook
└── translations/
    ├── en.ts                    # English translations
    ├── ar.ts                    # Arabic translations
    ├── es.ts                    # Spanish translations
    ├── fr.ts                    # French translations
    └── zh.ts                    # Chinese translations
```

#### How It Works

1. **Language Context** (`lib/LanguageContext.tsx`):
   - Provides global language state using React Context
   - Stores current language in localStorage for persistence
   - Exports `useLanguage()` hook for accessing translations
   - Returns current `language`, `setLanguage()` function, and `t` translation object

2. **Translation Files** (`lib/translations/*.ts`):
   - Each file exports a const with all translations for that language
   - Structure: `{ nav, hero, features, playground, cta, footer }`
   - All files must have identical structure for type safety

3. **Components Usage**:
   ```typescript
   import { useLanguage } from '@/lib/LanguageContext'

   const MyComponent = () => {
     const { t, language, setLanguage } = useLanguage()

     return <h1>{t.hero.title}</h1>
   }
   ```

#### API Language Support

1. **Speech-to-Text** (`app/api/speech/transcribe/route.ts`):
   - Accepts `language` parameter in FormData
   - Uses Deepgram **Whisper-large** model for non-English languages
   - Uses Deepgram **Nova-2** model for English (faster with smart formatting)
   - Language codes: `en`, `ar`, `es`, `fr`, `zh`

2. **AI Chat** (`app/api/chat/route.ts`):
   - Accepts `language` parameter in JSON request
   - Adds language-specific instructions to OpenAI system prompt
   - AI responds in the user's selected language
   - Example: "IMPORTANT: Respond in Arabic language only..."

3. **Text-to-Speech** (`components/SimpleVoicePlayground.tsx`):
   - Uses browser's **Web Speech API** (supports all languages)
   - Language mapping: EN→en-US, AR→ar-SA, ES→es-ES, FR→fr-FR, ZH→zh-CN
   - Replaced Deepgram TTS (only supported EN/ES)

#### Adding a New Language

Follow these steps to add a new language (e.g., German - DE):

**Step 1: Create Translation File**

Create `lib/translations/de.ts`:

```typescript
export const de = {
  nav: {
    features: 'Funktionen',
    playground: 'Spielplatz',
    getStarted: 'Loslegen',
  },
  hero: {
    title: '...',
    subtitle: '...',
    // ... copy structure from en.ts
  },
  // ... all other sections
}
```

**Step 2: Update Language Context**

In `lib/LanguageContext.tsx`:

```typescript
import { de } from './translations/de'

type Language = 'EN' | 'AR' | 'ES' | 'FR' | 'ZH' | 'DE'

const translations = {
  EN: en,
  AR: ar,
  ES: es,
  FR: fr,
  ZH: zh,
  DE: de,  // Add here
}
```

**Step 3: Update Navigation Component**

In `components/Navigation.tsx`, add the language option:

```typescript
const languages: Language[] = ['EN', 'AR', 'ES', 'FR', 'ZH', 'DE']
```

**Step 4: Update API Language Mapping**

In `app/api/speech/transcribe/route.ts`:

```typescript
const getDeepgramLanguage = (lang: string): string => {
  const languageMap: { [key: string]: string } = {
    'EN': 'en',
    'AR': 'ar',
    'ES': 'es',
    'FR': 'fr',
    'ZH': 'zh',
    'DE': 'de',  // Add here
  }
  return languageMap[lang] || 'en'
}
```

In `app/api/chat/route.ts`:

```typescript
const languageMap: { [key: string]: string } = {
  'en': 'English',
  'ar': 'Arabic',
  'es': 'Spanish',
  'fr': 'French',
  'zh': 'Chinese',
  'de': 'German',  // Add here
}
```

In `components/SimpleVoicePlayground.tsx`:

```typescript
const langMap: { [key: string]: string } = {
  'EN': 'en-US',
  'AR': 'ar-SA',
  'ES': 'es-ES',
  'FR': 'fr-FR',
  'ZH': 'zh-CN',
  'DE': 'de-DE',  // Add here for TTS
}
```

**Step 5: Test the New Language**

1. Build the project: `npm run build`
2. Check TypeScript errors (all translation files must have same structure)
3. Test in browser:
   - Language selector shows new language
   - All UI text translates correctly
   - Voice transcription works in new language
   - AI responds in new language
   - TTS speaks in new language

#### Translation Structure

All translation files must include these sections:

```typescript
{
  nav: { features, playground, getStarted },
  hero: { title, subtitle, watchDemo, getStarted, stats: { ... } },
  features: { title, subtitle, items: [...] },
  playground: {
    title, subtitle, micTest, testMicButton, chooseService,
    pharmacyTitle, pharmacyDesc, dhlTitle, dhlDesc,
    processing, listening, audioLevel, ...
    startConversation, inputPlaceholder, sendButton, aiResponses: [...]
  },
  cta: { title, subtitle, getStarted, scheduleDemo, features: { ... } },
  footer: { tagline, product, features, company, resources, legal, ... }
}
```

#### Important Notes

- **TypeScript Type Safety**: All translation files must have identical structure
- **Empty Arrays**: Always provide type annotation (e.g., `const arr: Type[] = []`)
- **Language Codes**:
  - UI uses uppercase: EN, AR, ES, FR, ZH
  - APIs use lowercase: en, ar, es, fr, zh
  - TTS uses locale codes: en-US, ar-SA, es-ES, fr-FR, zh-CN
- **RTL Support**: Arabic text automatically displays right-to-left (browser default)
- **Model Selection**:
  - English: Deepgram Nova-2 (faster, smart formatting)
  - Other languages: Deepgram Whisper-large (90+ languages)

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

## Version Control & Deployment

### Versioning Strategy

**We use Semantic Versioning (SemVer)**: `v{MAJOR}.{MINOR}.{PATCH}`

- **MAJOR** (v2.0.0): Breaking changes, complete redesigns
- **MINOR** (v1.1.0): New features, non-breaking changes
- **PATCH** (v1.1.1): Bug fixes, small improvements

**Current Version**: `v1.2.0`

**Version History**:
- `v1.2.0` - Complete multilingual support (EN, AR, ES, FR, ZH)
- `v1.1.5` - Fixed voice transcription audio level detection
- `v1.1.0` - Fixed voice recording audio capture issue
- `v1.0.0` - Initial VoiceBridge AI landing page

See `VERSION.md` for complete version history.

### Creating New Versions

**IMPORTANT**: Always create a new version tag for any changes:

```bash
# 1. Make changes and commit
git add .
git commit -m "Your change description

🤖 Generated with Claude Code
Authored-By: Eng. Bader Alshehri"

# 2. Create version tag
# For bug fixes (patch):
git tag -a v1.1.1 -m "v1.1.1 - Bug fix description"

# For new features (minor):
git tag -a v1.2.0 -m "v1.2.0 - New feature description"

# For breaking changes (major):
git tag -a v2.0.0 -m "v2.0.0 - Breaking change description"

# 3. Push commit and tags
git push origin main
git push origin --tags

# 4. Update VERSION.md with new entry
```

### Rollback to Previous Version

If changes don't work as intended:

```bash
# View all versions
git tag -l

# Rollback to previous version
git checkout v1.0.0

# Or create a rollback branch
git checkout -b rollback-to-v1.0.0 v1.0.0
```

### Git & GitHub
- Repository: https://github.com/bgash22/voicebridge-ai-website
- GitHub account: bgash22
- Main branch: `main`
- GitHub CLI authenticated and ready to use
- **Always use version tags** for tracking changes

### Vercel (Production)
- **Custom Domain**: https://aivoicebridge.com
- Vercel URL: https://voicebridge-m5nuewcc5-bader-alshehris-projects.vercel.app
- Dashboard: https://vercel.com/bader-alshehris-projects/voicebridge-ai
- Vercel CLI installed and authenticated
- Auto-deploys on push to main branch
- Connected to GitHub repository

#### Custom Domain Setup (Already Configured)
The custom domain `aivoicebridge.com` is configured in Vercel:
1. Domain added in Vercel Dashboard → Project Settings → Domains
2. DNS records configured to point to Vercel
3. SSL certificate automatically provisioned by Vercel
4. Both www and non-www versions supported

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
- SimpleVoicePlayground is the active component; AIPlayground component exists but is not used

### Recent Changes
- **v1.2.0**: Added complete multilingual support (EN, AR, ES, FR, ZH)
  - Created React Context for language state management
  - Implemented translation files for all 5 languages
  - Updated Speech-to-Text to use Deepgram Whisper for non-English languages
  - AI chat now responds in user's selected language via OpenAI
  - Replaced Deepgram TTS with Web Speech API for broader language support
  - Added language selector to navigation bar
- **v1.1.5**: Fixed voice transcription audio level detection
- Added custom domain aivoicebridge.com
- Fixed CSS errors in `app/globals.css` (removed invalid Tailwind classes)
- Added VB logo (`public/logo.png` with transparent background)
- Updated color theme to cyan/teal to match brand logo

### Future Considerations
- Restore full Three.js 3D implementation in Hero3D
- Add user authentication flows with Supabase
- Analytics and monitoring integration

### Performance
- Next.js handles code splitting automatically
- Images should use Next.js Image component for optimization
- Consider lazy loading heavy 3D components when restored
