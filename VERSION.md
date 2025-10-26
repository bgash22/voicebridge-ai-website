# VoiceBridge AI Website - Version History

## Versioning Strategy

We use **Semantic Versioning** (SemVer) for this project:

**Format**: `v{MAJOR}.{MINOR}.{PATCH}`

- **MAJOR** (v2.0.0): Breaking changes, complete redesigns
- **MINOR** (v1.1.0): New features, non-breaking changes
- **PATCH** (v1.1.1): Bug fixes, small improvements

## Current Version

**Latest**: `v1.3.1` - Stable version with Banking/Clinic fix (recommended for rollback)

## Version History

### v1.3.1 (2025-10-27) ⭐ **STABLE ROLLBACK POINT**
**Type**: Patch - Bug Fix

**Changes**:
- ✅ Fixed assistant name display for Banking and Clinic services
- ✅ Changed ternary operator to conditional rendering for all 4 service types
- ✅ Banking now correctly shows "Banking Assistant" instead of "DHL Tracking Assistant"
- ✅ Clinic now correctly shows "Medical Clinic Assistant" instead of "DHL Tracking Assistant"

**Technical Implementation**:
- Updated SimpleVoicePlayground.tsx line 1090-1094
- Replaced `{serviceType === 'pharmacy' ? t.playground.pharmacyAssistant : t.playground.dhlAssistant}`
- With individual conditional checks for all 4 services

**Commit**: `fae26e6`
**Author**: Eng. Bader Alshehri
**Files Changed**: 1 file (4 insertions, 1 deletion)

**Key Files**:
- `components/SimpleVoicePlayground.tsx` (lines 1090-1094)

**Rollback Usage**:
```bash
# To rollback to this stable version in the future:
git checkout v1.3.1
# Or create a branch from this version:
git checkout -b rollback-to-stable v1.3.1
```

---

### v1.3.0 (2025-10-26)
**Type**: Minor - New Features

**Changes**:
- ✅ Added 3 new languages: German (DE), Turkish (TR), Hindi (HI) - total 8 languages
- ✅ Added Banking showcase service (balance checks, fund transfers, account inquiries)
- ✅ Added Clinic showcase service (appointment scheduling, doctor availability, medical inquiries)
- ✅ Extended service selection to 4 options: Pharmacy, DHL, Banking, Clinic
- ✅ Updated all 8 language files with banking and clinic translations
- ✅ Added service-specific system prompts for Banking and Clinic in chat API
- ✅ Updated transcript analyzer to handle Banking and Clinic action items
- ✅ Enhanced UI with 2x2 service grid featuring distinct colors and emojis

**Technical Implementation**:
- Created translation files: de.ts, tr.ts, hi.ts
- Extended SimpleVoicePlayground serviceType to support 4 services
- Added systemPrompts object in chat API for all 4 service types
- Updated saveScript function with service name mapping
- Enhanced analyzeTranscript with Banking/Clinic-specific action item detection
- Added bankingTitle/Desc/Example/Assistant and clinicTitle/Desc/Example/Assistant keys to all translations

**Commit**: `e4612f5`
**Author**: Eng. Bader Alshehri
**Files Changed**: 12 files (548 insertions, 12 deletions)

**Key Files**:
- `lib/translations/de.ts, tr.ts, hi.ts` - New language translation files
- `lib/translations/index.ts` - Added DE, TR, HI exports
- `lib/translations/en.ts, ar.ts, es.ts, fr.ts, zh.ts` - Added banking/clinic keys
- `components/Navigation.tsx` - Added DE, TR, HI to language selector
- `components/SimpleVoicePlayground.tsx` - Extended to support 4 services
- `app/api/chat/route.ts` - Added banking and clinic system prompts

---

### v1.2.0 (2025-10-13)
**Type**: Minor - New Feature

**Changes**:
- ✅ Added complete multilingual support for 5 languages (English, Arabic, Spanish, French, Chinese)
- ✅ Voice transcription in all languages using Deepgram Whisper
- ✅ AI chat responses in user's selected language via OpenAI
- ✅ Text-to-speech in all languages using Web Speech API
- ✅ Complete UI translations for playground section
- ✅ Language selector in navigation bar
- ✅ Language-aware system prompts for AI assistant
- ✅ Removed GitHub links from footer

**Technical Implementation**:
- Updated transcribe API to use Whisper model for non-English languages (nova-2 for English)
- Added language parameter to chat API with multilingual prompts
- Replaced Deepgram TTS with browser Web Speech API for broader language support
- Created translation system with React Context API
- Added translation files: en.ts, ar.ts, es.ts, fr.ts, zh.ts

**Commit**: `6d158fc`
**Author**: Eng. Bader Alshehri
**Files Changed**: 19 files (893 insertions, 155 deletions)

**Key Files**:
- `app/api/speech/transcribe/route.ts` - Whisper integration for multilingual STT
- `app/api/chat/route.ts` - Language-aware AI responses
- `components/SimpleVoicePlayground.tsx` - Web Speech API for TTS
- `lib/LanguageContext.tsx` - Language state management
- `lib/translations/*` - Translation files for all languages
- `components/Navigation.tsx` - Language selector
- `components/Footer.tsx` - Removed GitHub links

---

### v1.1.5 (2025-10-10)
**Type**: Patch - Bug Fix

**Changes**:
- ✅ Fixed "Transcription failed" errors due to audio level detection issues
- ✅ Normalized RMS audio levels (* 100) for better threshold detection
- ✅ Added minimum recording duration check (0.5 seconds)
- ✅ Improved audio level thresholds (1.0 minimum, 5.0 recommended)
- ✅ Enhanced real-time audio feedback with 🔴/🟡/🟢 indicators
- ✅ Updated visual indicator thresholds from 1/10 to 5/15
- ✅ Added helpful messages during recording ("Move closer to microphone!")
- ✅ Better error messages for audio validation failures

**Commit**: `d830643`
**Author**: Eng. Bader Alshehri
**Files Changed**: 1 file (43 insertions, 6 deletions)

**Key Files**:
- `components/SimpleVoicePlayground.tsx` (lines 95-120, 182-235, 775-807)

---

### v1.1.4 (2025-10-10)
**Type**: Patch - UI Update

**Changes**:
- ✅ Changed "Watch Demo" to "Schedule Demo" in HeroSection
- ✅ Improved button text consistency across components

**Files Changed**:
- `components/HeroSection.tsx`

---

### v1.1.3 (2025-10-10)
**Type**: Patch - Link Fixes

**Changes**:
- ✅ Fixed CTA buttons to link to playground and sales email
- ✅ Updated all email addresses to aivoicebridge.com domain
- ✅ Added pre-filled email subjects and bodies

**Files Changed**:
- `components/CTASection.tsx`
- `components/HeroSection.tsx`

---

### v1.1.2 (2025-10-10)
**Type**: Patch - Link Fixes

**Changes**:
- ✅ Fixed broken navigation links
- ✅ Updated footer links to functional destinations
- ✅ Removed non-existent docs link
- ✅ Changed Pricing to Get Started

**Files Changed**:
- `components/Navigation.tsx`
- `components/Footer.tsx`

---

### v1.1.1 (2025-10-10)
**Type**: Patch - Documentation

**Changes**:
- ✅ Added comprehensive versioning system
- ✅ Created VERSION.md documentation
- ✅ Updated CLAUDE.md with versioning workflow
- ✅ Implemented Semantic Versioning (SemVer) strategy

**Files Changed**:
- `VERSION.md` (new file)
- `CLAUDE.md`

---

### v1.1.0 (2025-10-10)
**Type**: Minor - Bug Fix

**Changes**:
- ✅ Fixed critical voice recording bug in SimpleVoicePlayground
- ✅ ScriptProcessorNode now properly connected to audio destination
- ✅ Lowered audio level threshold from 1 to 0.1 for better detection
- ✅ Reordered validation logic (check chunks first, then audio level)
- ✅ Improved error messages for better user feedback
- ✅ Added API routes for chat, transcription, and synthesis
- ✅ Added documentation (IMPLEMENTATION_SUMMARY.md, PLAYGROUND_INTEGRATION.md)

**Commit**: `b5e0360`
**Author**: Eng. Bader Alshehri
**Files Changed**: 22 files (4,159 insertions, 4 deletions)

**Key Files**:
- `components/SimpleVoicePlayground.tsx` (lines 119-124, 182-201)
- `app/api/chat/route.ts`
- `app/api/speech/transcribe/route.ts`
- `app/api/speech/synthesize/route.ts`

---

### v1.0.0 (2025-10-08)
**Type**: Major - Initial Release

**Changes**:
- ✅ Initial VoiceBridge AI landing page
- ✅ Navigation component with responsive menu
- ✅ Hero section with gradient animations
- ✅ Features section showcasing AI capabilities
- ✅ Footer with social links
- ✅ Tailwind CSS styling
- ✅ Framer Motion animations
- ✅ Next.js 15 with App Router

**Commit**: `18a3f0f`
**Author**: Eng. Bader Alshehri

---

## How to Use Versions

### Rollback to Previous Version

If a new version has issues, you can rollback:

```bash
# View all versions
git tag -l

# Checkout a specific version (read-only)
git checkout v1.0.0

# Create a new branch from a version
git checkout -b rollback-to-v1.0.0 v1.0.0

# Or reset to a version (CAREFUL: destructive)
git reset --hard v1.0.0
```

### Create New Version

When making changes, follow this workflow:

```bash
# 1. Make your changes
# Edit files...

# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "Add new feature X

- Detail 1
- Detail 2

🤖 Generated with Claude Code
Authored-By: Eng. Bader Alshehri"

# 4. Tag the version
# For bug fixes:
git tag -a v1.1.1 -m "v1.1.1 - Bug fix description"

# For new features:
git tag -a v1.2.0 -m "v1.2.0 - New feature description"

# For breaking changes:
git tag -a v2.0.0 -m "v2.0.0 - Breaking change description"

# 5. Push commit and tags
git push origin main
git push origin --tags

# 6. Update VERSION.md with new entry
# Add entry above this line...
```

## Version Naming Convention

### Bug Fixes (PATCH)
- `v1.1.1` - Fixed microphone permissions
- `v1.1.2` - Fixed audio playback delay
- `v1.1.3` - Fixed API error handling

### New Features (MINOR)
- `v1.2.0` - Added user authentication
- `v1.3.0` - Added conversation history
- `v1.4.0` - Added analytics dashboard

### Breaking Changes (MAJOR)
- `v2.0.0` - Complete UI redesign
- `v3.0.0` - Migrated to new API

## Testing Versions

Before creating a version tag:

1. ✅ Test all features locally
2. ✅ Check browser console for errors
3. ✅ Verify voice recording works
4. ✅ Test API endpoints
5. ✅ Run build: `npm run build`
6. ✅ Review git diff

## Deployment

Production deployments should always use tagged versions:

```bash
# Deploy specific version to Vercel
git checkout v1.1.0
vercel --prod

# Or specify version in deployment
vercel deploy --prod --target v1.1.0
```

## Version Comparison

```bash
# Compare two versions
git diff v1.0.0 v1.1.0

# View changes in specific version
git show v1.1.0

# List files changed between versions
git diff --name-only v1.0.0 v1.1.0
```

## Best Practices

1. **Always tag after testing** - Don't tag untested code
2. **Update VERSION.md** - Document every version
3. **Use descriptive messages** - Explain what changed and why
4. **Follow SemVer** - Consistent versioning helps everyone
5. **Keep main stable** - Only merge tested code
6. **Tag before deploy** - Production should use tagged versions

## GitHub Releases

After pushing tags, create GitHub releases:

1. Go to: https://github.com/bgash22/voicebridge-ai-website/releases
2. Click "Draft a new release"
3. Choose tag (e.g., v1.1.0)
4. Write release notes
5. Attach binaries if needed
6. Publish release

---

**Note**: This file should be updated with every new version tag.
