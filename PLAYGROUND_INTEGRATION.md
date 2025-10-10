# AI Playground Integration Guide

## Overview
This guide explains how to integrate the VoiceBridge AI voice agent (from `voice_agent_app`) into the Website's AIPlayground component.

## Current State
- **Website**: Next.js landing page with mock AIPlayground (`components/AIPlayground.tsx`)
- **Voice Agent**: Python backend with Deepgram Agent API (`voice_agent_app/main_agent_api.py`)
- **Current Playground**: Text-only chat with random mock responses (lines 23-34)

## Integration Architecture

### Option 1: Direct WebSocket Integration (Recommended)
Connect the AIPlayground directly to your Deepgram Agent API via WebSocket.

```
User Browser → Website (Next.js) → Deepgram Agent API → OpenAI → Pharmacy/DHL Functions
```

**Pros:**
- Real-time voice interaction
- Low latency
- Native browser audio APIs
- No intermediary server needed

**Cons:**
- Exposes Deepgram API key (need API route proxy)
- More complex frontend code

### Option 2: Backend Proxy via API Routes
Create Next.js API routes that proxy requests to your Python backend.

```
User Browser → Next.js API Route → Python Backend → Deepgram → OpenAI
```

**Pros:**
- Secure (API keys hidden)
- Can add authentication/rate limiting
- Reuse existing Python logic

**Cons:**
- Additional hop increases latency
- Need to maintain Python server

## Implementation Steps

### Step 1: Add Voice Input/Output to AIPlayground

Create a new component `components/VoicePlayground.tsx`:

```typescript
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'

interface Message {
  role: 'user' | 'ai'
  text: string
  timestamp: Date
}

export default function VoicePlayground() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [serviceType, setServiceType] = useState<'pharmacy' | 'dhl' | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Connect to Deepgram Agent API
  const connectToAgent = async () => {
    try {
      // Call Next.js API route to get WebSocket URL
      const response = await fetch('/api/agent/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const { wsUrl } = await response.json()

      // Connect to Deepgram Agent API
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('[VoicePlayground] Connected to agent')
        setIsConnected(true)

        // Send configuration (from config_agent_api.json)
        ws.send(JSON.stringify({
          type: 'Settings',
          audio: {
            input: { encoding: 'mulaw', sample_rate: 8000 },
            output: { encoding: 'mulaw', sample_rate: 8000, container: 'none' }
          },
          agent: { /* your agent config */ }
        }))
      }

      ws.onmessage = (event) => {
        handleAgentMessage(event.data)
      }

      ws.onerror = (error) => {
        console.error('[VoicePlayground] WebSocket error:', error)
        setIsConnected(false)
      }

      ws.onclose = () => {
        console.log('[VoicePlayground] Disconnected from agent')
        setIsConnected(false)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[VoicePlayground] Failed to connect:', error)
    }
  }

  // Handle messages from agent
  const handleAgentMessage = (data: string | Blob) => {
    if (typeof data === 'string') {
      const message = JSON.parse(data)

      // Handle different message types
      switch (message.type) {
        case 'Transcript':
          // User speech transcript
          if (message.is_final) {
            setConversation(prev => [...prev, {
              role: 'user',
              text: message.text,
              timestamp: new Date()
            }])
          }
          break

        case 'AgentResponse':
          // AI response text
          setConversation(prev => [...prev, {
            role: 'ai',
            text: message.text,
            timestamp: new Date()
          }])
          break

        case 'FunctionCallRequest':
          // Agent is calling a function (pharmacy/DHL)
          console.log('[VoicePlayground] Function call:', message.functions)
          break
      }
    } else {
      // Binary audio data from agent
      playAudioChunk(data)
    }
  }

  // Start recording user voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Send audio to agent
          wsRef.current.send(event.data)
        }
      }

      mediaRecorder.start(100) // Send chunks every 100ms
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (error) {
      console.error('[VoicePlayground] Failed to start recording:', error)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  // Play audio chunk from agent
  const playAudioChunk = async (audioBlob: Blob) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 8000 })
    }

    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)

    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContextRef.current.destination)
    source.start()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close()
      if (mediaRecorderRef.current) stopRecording()
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  return (
    <section
      id="playground"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient">
            Try It Live
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience real AI voice interaction. Choose a service and start talking.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-morphism rounded-3xl p-8 max-w-3xl mx-auto"
        >
          {/* Service Selection */}
          {!serviceType && (
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Choose a Service</h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setServiceType('pharmacy')
                    connectToAgent()
                  }}
                  className="p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white font-semibold text-lg hover:shadow-xl"
                >
                  💊 Pharmacy Services
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setServiceType('dhl')
                    connectToAgent()
                  }}
                  className="p-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl text-white font-semibold text-lg hover:shadow-xl"
                >
                  📦 DHL Tracking
                </motion.button>
              </div>
            </div>
          )}

          {/* Voice Interface */}
          {serviceType && (
            <>
              {/* Chat Display */}
              <div className="bg-black/30 rounded-2xl p-6 mb-6 h-96 overflow-y-auto">
                {conversation.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎤</div>
                      <p>Click the microphone to start talking...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                              : 'bg-gray-800 text-gray-200'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Controls */}
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!isConnected}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-xl'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRecording ? '⏹️' : '🎤'}
                </motion.button>

                <div className="text-gray-400">
                  {!isConnected && 'Connecting...'}
                  {isConnected && !isRecording && 'Click to talk'}
                  {isRecording && 'Listening...'}
                </div>
              </div>

              {/* Voice Visualizer */}
              <div className="mt-6 flex items-center justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-primary-500 to-accent-500 rounded-full"
                    animate={{
                      height: isRecording ? [8, 24, 8] : 8,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: isRecording ? Infinity : 0,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
```

### Step 2: Create Next.js API Route

Create `Website/app/api/agent/connect/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get Deepgram API key from environment
    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      )
    }

    // Return WebSocket URL with API key
    const wsUrl = `wss://agent.deepgram.com/v1/agent/converse?token=${apiKey}`

    return NextResponse.json({ wsUrl })
  } catch (error) {
    console.error('Failed to generate agent connection:', error)
    return NextResponse.json(
      { error: 'Failed to connect to agent' },
      { status: 500 }
    )
  }
}
```

### Step 3: Add Environment Variables

Add to `Website/.env.local`:

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Update Main Page

Replace `AIPlayground` with `VoicePlayground` in `Website/app/page.tsx`:

```typescript
import VoicePlayground from '@/components/VoicePlayground'

// ... other imports

export default function Home() {
  return (
    <main>
      {/* ... other sections */}
      <VoicePlayground />
      {/* ... other sections */}
    </main>
  )
}
```

### Step 5: Deploy Backend Functions

You need to expose your pharmacy and DHL functions via API. Two options:

#### Option A: Keep Python Backend Running
- Deploy `voice_agent_app` to a server (Railway, Render, Fly.io)
- Update API route to forward function calls to Python backend

#### Option B: Rewrite Functions in TypeScript
- Port `pharmacy_functions.py` and `dhl_functions.py` to TypeScript
- Create API routes for each function
- Simpler deployment (single Next.js app)

## Configuration

### Agent Config for Website

Create `Website/config/agent.json`:

```json
{
  "type": "Settings",
  "audio": {
    "input": {
      "encoding": "mulaw",
      "sample_rate": 8000
    },
    "output": {
      "encoding": "mulaw",
      "sample_rate": 8000,
      "container": "none"
    }
  },
  "agent": {
    "language": "en",
    "listen": {
      "provider": {
        "type": "deepgram",
        "model": "nova-3"
      }
    },
    "think": {
      "provider": {
        "type": "open_ai",
        "model": "gpt-4o-mini",
        "temperature": 0.7
      },
      "prompt": "You are a professional assistant helping customers with pharmacy services and DHL package tracking...",
      "functions": [
        {
          "name": "get_drug_info",
          "description": "Get detailed information about a specific drug...",
          "parameters": {
            "type": "object",
            "properties": {
              "drug_name": {
                "type": "string",
                "description": "Name of the drug to look up"
              }
            },
            "required": ["drug_name"]
          }
        },
        {
          "name": "track_shipment",
          "description": "Track a DHL shipment using the tracking number...",
          "parameters": {
            "type": "object",
            "properties": {
              "tracking_number": {
                "type": "string",
                "description": "The DHL tracking number (10-14 digits)"
              }
            },
            "required": ["tracking_number"]
          }
        }
      ]
    },
    "speak": {
      "provider": {
        "type": "deepgram",
        "model": "aura-asteria-en"
      }
    },
    "greeting": "Hello! Would you like help with pharmacy services or DHL package tracking?"
  }
}
```

## Testing

### Local Testing

1. **Start Next.js dev server:**
   ```bash
   cd Website
   npm run dev
   ```

2. **Test in browser:**
   - Navigate to `http://localhost:3000`
   - Click "Try It Live" section
   - Allow microphone access
   - Choose pharmacy or DHL service
   - Start talking

3. **Monitor console:**
   - Check browser console for WebSocket messages
   - Check Next.js terminal for API route logs

### Production Testing

1. **Deploy to Vercel:**
   ```bash
   cd Website
   vercel --prod
   ```

2. **Add environment variables in Vercel dashboard:**
   - `DEEPGRAM_API_KEY`
   - `OPENAI_API_KEY`

3. **Test live site:**
   - Visit your Vercel URL
   - Test voice interaction

## Troubleshooting

### Common Issues

1. **Microphone not working:**
   - Check browser permissions
   - HTTPS required for microphone access in production
   - Vercel provides HTTPS by default

2. **WebSocket connection fails:**
   - Check API key is valid
   - Verify Deepgram account has Agent API access
   - Check browser console for error messages

3. **Audio not playing:**
   - Check AudioContext is initialized after user interaction
   - Verify audio format matches (mulaw, 8kHz)
   - Some browsers require user gesture before playing audio

4. **Functions not executing:**
   - Check function definitions match config
   - Verify API routes are deployed
   - Check server logs for errors

## Next Steps

### Phase 1: Basic Voice Interaction ✅
- [x] Connect to Deepgram Agent API
- [ ] Implement voice recording
- [ ] Implement audio playback
- [ ] Display transcripts

### Phase 2: Function Integration
- [ ] Port pharmacy functions to TypeScript
- [ ] Port DHL functions to TypeScript
- [ ] Create API routes for each function
- [ ] Connect functions to agent

### Phase 3: Enhanced UX
- [ ] Add voice waveform visualization
- [ ] Add typing indicators
- [ ] Add error handling and retry logic
- [ ] Add call duration timer
- [ ] Add service selection persistence

### Phase 4: Production Readiness
- [ ] Add rate limiting
- [ ] Add user authentication
- [ ] Add call analytics
- [ ] Add conversation history
- [ ] Add feedback system

## Alternative: Simpler Implementation

If full voice integration is complex, start with a simpler text-based implementation:

1. **Keep text input/output**
2. **Add API route that calls OpenAI with function calling**
3. **Execute pharmacy/DHL functions server-side**
4. **Add voice as Phase 2**

This lets you test the agent logic first before adding voice complexity.

## Resources

- [Deepgram Agent API Docs](https://developers.deepgram.com/docs/agent-api)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
