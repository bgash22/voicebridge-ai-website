'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { useInView } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'

interface Message {
  role: 'user' | 'ai'
  text: string
  timestamp: Date
}

interface Analysis {
  totalTurns: number
  talkRatioUser: number
  sentiment: 'positive' | 'neutral' | 'negative'
  summary: string
  actionItems: string[]
}

export default function SimpleVoicePlayground() {
  const { t, language } = useLanguage()
  const [isRecording, setIsRecording] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [serviceType, setServiceType] = useState<'pharmacy' | 'dhl' | 'banking' | 'clinic' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [lastRecording, setLastRecording] = useState<Blob | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testAudioLevel, setTestAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Float32Array[]>([])  // Store raw audio data
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isRecordingRef = useRef<boolean>(false)  // Ref to avoid closure issues
  const [audioLevel, setAudioLevel] = useState(0)
  const audioLevelRef = useRef<number>(0)
  const maxAudioLevelRef = useRef<number>(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Map language codes to Deepgram format (uppercase to lowercase)
  const getDeepgramLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'EN': 'en',
      'AR': 'ar',
      'ES': 'es',
      'FR': 'fr',
      'ZH': 'zh',
      'DE': 'de',
      'TR': 'tr',
      'HI': 'hi'
    }
    return languageMap[lang] || 'en'
  }

  // Start recording user voice using Web Audio API
  const startRecording = async () => {
    try {
      setError(null)
      console.log('[SimpleVoice] Requesting microphone access...')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream

      // Always close previous audio context if it exists
      if (audioContextRef.current) {
        try {
          await audioContextRef.current.close()
          console.log('[SimpleVoice] Closed previous AudioContext')
        } catch (e) {
          console.log('[SimpleVoice] Error closing previous AudioContext:', e)
        }
      }

      // Create fresh audio context with 16kHz sample rate for each recording
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      })

      const audioContext = audioContextRef.current
      console.log('[SimpleVoice] Created new AudioContext, sample rate:', audioContext.sampleRate, 'state:', audioContext.state)

      // Ensure AudioContext is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
        console.log('[SimpleVoice] Resumed suspended AudioContext, new state:', audioContext.state)
      }

      const source = audioContext.createMediaStreamSource(stream)

      // Create analyser for level monitoring
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Create ScriptProcessorNode for raw audio capture (4096 buffer size)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      // Reset audio chunks and max level
      audioChunksRef.current = []
      maxAudioLevelRef.current = 0

      // Capture audio data
      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) {
          console.log('[SimpleVoice] onaudioprocess called but not recording, skipping')
          return
        }

        const inputData = e.inputBuffer.getChannelData(0)
        const audioData = new Float32Array(inputData)

        // Calculate RMS to see if there's actual audio
        let sum = 0
        for (let i = 0; i < audioData.length; i++) {
          sum += audioData[i] * audioData[i]
        }
        const rms = Math.sqrt(sum / audioData.length)
        const rmsNormalized = rms * 100 // Normalize RMS for display

        audioChunksRef.current.push(audioData)

        // Update max level tracker with normalized RMS
        if (rmsNormalized > maxAudioLevelRef.current) {
          maxAudioLevelRef.current = rmsNormalized
        }

        console.log('[SimpleVoice] Captured audio chunk:', audioData.length, 'samples, RMS:', rms.toFixed(4), 'Normalized:', rmsNormalized.toFixed(2))
      }

      // Connect audio pipeline
      // Connect source to both processor and analyser
      source.connect(processor)

      // CRITICAL: ScriptProcessorNode MUST be connected to destination to work
      // Use a gain node set to 0 to avoid echo/feedback
      const silentGain = audioContext.createGain()
      silentGain.gain.value = 0
      processor.connect(silentGain)
      silentGain.connect(audioContext.destination)

      // Monitor audio levels
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const checkAudioLevel = () => {
        if (isRecording && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength

          setAudioLevel(average)
          audioLevelRef.current = average

          if (average > maxAudioLevelRef.current) {
            maxAudioLevelRef.current = average
          }

          console.log('[SimpleVoice] Audio level:', average.toFixed(2), 'Max:', maxAudioLevelRef.current.toFixed(2))
          requestAnimationFrame(checkAudioLevel)
        }
      }
      checkAudioLevel()

      setIsRecording(true)
      isRecordingRef.current = true  // Set ref for onaudioprocess callback
      console.log('[SimpleVoice] Recording started with Web Audio API (16kHz)')
    } catch (error) {
      console.error('[SimpleVoice] Failed to start recording:', error)
      setError('Microphone access denied. Please allow microphone access.')
    }
  }

  // Stop recording and process audio
  const stopRecording = async () => {
    if (!isRecording) return

    setIsRecording(false)
    isRecordingRef.current = false  // Set ref for onaudioprocess callback

    const currentLevel = audioLevelRef.current
    const maxLevel = maxAudioLevelRef.current

    console.log('[SimpleVoice] Recording stopped, total chunks:', audioChunksRef.current.length)
    console.log('[SimpleVoice] Current audio level:', currentLevel.toFixed(2))
    console.log('[SimpleVoice] Max audio level during recording:', maxLevel.toFixed(2))

    // Cleanup audio nodes
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // First check if we got any audio chunks at all
    if (audioChunksRef.current.length === 0) {
      console.error('[SimpleVoice] No audio chunks recorded!')
      setError('No audio was recorded. Please check your microphone permissions and try again.')
      setAudioLevel(0)
      audioLevelRef.current = 0
      maxAudioLevelRef.current = 0
      return
    }

    // Check recording duration (minimum 0.5 seconds of audio at 16kHz = 8000 samples)
    const totalSamples = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
    const durationSeconds = totalSamples / (audioContextRef.current?.sampleRate || 16000)

    console.log('[SimpleVoice] Recording duration:', durationSeconds.toFixed(2), 'seconds')

    if (durationSeconds < 0.5) {
      console.error('[SimpleVoice] Recording too short:', durationSeconds, 'seconds')
      setError('Recording too short. Please hold the button longer while speaking.')
      setAudioLevel(0)
      audioLevelRef.current = 0
      maxAudioLevelRef.current = 0
      audioChunksRef.current = []
      return
    }

    // Check if audio level was reasonable (threshold of 1.0 for normalized RMS)
    // Note: maxLevel is now normalized (RMS * 100), so values like 5-50 are typical for speech
    if (maxLevel < 1.0) {
      console.error('[SimpleVoice] WARNING: Max audio level was very low:', maxLevel)
      setError('No audio detected. Please check your microphone and speak much louder.')
      setAudioLevel(0)
      audioLevelRef.current = 0
      maxAudioLevelRef.current = 0
      audioChunksRef.current = []
      return
    }

    if (maxLevel < 5.0) {
      console.error('[SimpleVoice] WARNING: Audio level was too low:', maxLevel)
      setError('Audio level is too low. Please speak much louder and move closer to your microphone.')
      setAudioLevel(0)
      audioLevelRef.current = 0
      maxAudioLevelRef.current = 0
      audioChunksRef.current = []
      return
    }

    // Merge all audio chunks into a single Float32Array
    const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
    const mergedAudio = new Float32Array(totalLength)
    let offset = 0
    for (const chunk of audioChunksRef.current) {
      mergedAudio.set(chunk, offset)
      offset += chunk.length
    }

    console.log('[SimpleVoice] Merged audio samples:', mergedAudio.length)
    console.log('[SimpleVoice] ✅ Audio level check PASSED - Max level was', maxLevel.toFixed(2))

    // Convert to WAV format
    const wavBlob = float32ArrayToWav(mergedAudio, audioContextRef.current!.sampleRate)
    console.log('[SimpleVoice] WAV file size:', wavBlob.size, 'bytes')

    // Save recording for debugging
    setLastRecording(wavBlob)
    console.log('[SimpleVoice] Recording saved - you can download it for debugging')

    // Process the audio
    await processAudio(wavBlob)

    // Reset
    setAudioLevel(0)
    audioLevelRef.current = 0
    maxAudioLevelRef.current = 0
    audioChunksRef.current = []
  }

  // Convert Float32Array to WAV Blob
  const float32ArrayToWav = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, 1, true) // mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // bits per sample
    writeString(36, 'data')
    view.setUint32(40, samples.length * 2, true)

    // Write audio data (convert float32 to int16)
    let offset = 44
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  // Convert WebM audio to WAV format for better Deepgram compatibility
  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    try {
      console.log('[SimpleVoice] Converting audio to WAV format...')

      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000
        })
      }

      const audioContext = audioContextRef.current

      // Decode the audio data
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Convert to WAV format
      const wavBuffer = audioBufferToWav(audioBuffer)
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })

      console.log('[SimpleVoice] Converted to WAV:', wavBlob.size, 'bytes')
      return wavBlob
    } catch (error) {
      console.error('[SimpleVoice] Failed to convert audio:', error)
      // If conversion fails, return original blob
      return audioBlob
    }
  }

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    const channels: Float32Array[] = []
    let offset = 0
    let pos = 0

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    // RIFF identifier
    setUint32(0x46464952)
    // File length
    setUint32(length - 8)
    // RIFF type
    setUint32(0x45564157)
    // Format chunk identifier
    setUint32(0x20746d66)
    // Format chunk length
    setUint32(16)
    // Sample format (raw)
    setUint16(1)
    // Channel count
    setUint16(buffer.numberOfChannels)
    // Sample rate
    setUint32(buffer.sampleRate)
    // Byte rate
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
    // Block align
    setUint16(buffer.numberOfChannels * 2)
    // Bits per sample
    setUint16(16)
    // Data chunk identifier
    setUint32(0x61746164)
    // Data chunk length
    setUint32(length - pos - 4)

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return arrayBuffer
  }

  // Process recorded audio
  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)

      // Step 1: Send audio to Deepgram for transcription (directly, no conversion)
      console.log('[SimpleVoice] Transcribing audio...')
      const transcript = await transcribeAudio(audioBlob)

      if (!transcript) {
        setIsProcessing(false)
        return
      }

      // Add user message to conversation
      setConversation(prev => [...prev, {
        role: 'user',
        text: transcript,
        timestamp: new Date()
      }])

      // Step 2: Send transcript to OpenAI for response
      console.log('[SimpleVoice] Getting AI response...')
      const aiResponse = await getAIResponse(transcript)

      // Add AI response to conversation
      setConversation(prev => [...prev, {
        role: 'ai',
        text: aiResponse,
        timestamp: new Date()
      }])

      // Step 3: Convert AI response to speech
      console.log('[SimpleVoice] Converting response to speech...')
      await speakText(aiResponse)

      setIsProcessing(false)
    } catch (error) {
      console.error('[SimpleVoice] Failed to process audio:', error)
      setError('Failed to process audio. Please try again.')
      setIsProcessing(false)
    }
  }

  // Transcribe audio using Deepgram
  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('language', getDeepgramLanguage(language))

      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[SimpleVoice] Transcription failed:', data)

        // Handle specific error cases
        if (data.error === 'Audio too short or silent') {
          setError('Audio too short. Please hold the button longer and speak clearly.')
        } else if (data.error === 'No speech detected') {
          setError('No speech detected. Please speak louder and closer to the microphone.')
        } else {
          setError(data.message || 'Transcription failed. Please try again.')
        }

        return null
      }

      if (!data.transcript || data.transcript.trim() === '') {
        setError('No speech detected. Please try again and speak clearly.')
        return null
      }

      console.log('[SimpleVoice] Transcribed:', data.transcript, 'Confidence:', data.confidence)
      return data.transcript
    } catch (error) {
      console.error('[SimpleVoice] Transcription error:', error)
      setError('Failed to transcribe audio. Please check your connection.')
      return null
    }
  }

  // Get AI response using OpenAI
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          serviceType: serviceType || 'pharmacy',
          conversationHistory: conversation,
          language: getDeepgramLanguage(language)
        })
      })

      if (!response.ok) {
        throw new Error('AI response failed')
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('[SimpleVoice] AI response error:', error)
      return 'Sorry, I encountered an error. Please try again.'
    }
  }

  // Speak text using browser's Web Speech API (supports all languages)
  const speakText = async (text: string) => {
    try {
      // Use Web Speech API for text-to-speech (browser built-in, supports multiple languages)
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(text)

      // Map language codes to speech synthesis language codes
      const langMap: { [key: string]: string } = {
        'EN': 'en-US',
        'AR': 'ar-SA',
        'ES': 'es-ES',
        'FR': 'fr-FR',
        'ZH': 'zh-CN',
        'DE': 'de-DE',
        'TR': 'tr-TR',
        'HI': 'hi-IN'
      }
      utterance.lang = langMap[language] || 'en-US'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      console.log('[SimpleVoice] Speaking text in language:', utterance.lang)

      // Speak the text
      synth.speak(utterance)

      // Wait for speech to complete
      return new Promise<void>((resolve) => {
        utterance.onend = () => {
          console.log('[SimpleVoice] Speech synthesis complete')
          resolve()
        }
        utterance.onerror = (error) => {
          console.error('[SimpleVoice] Speech synthesis error:', error)
          resolve()
        }
      })
    } catch (error) {
      console.error('[SimpleVoice] Speech synthesis error:', error)
    }
  }

  // Download last recording for debugging
  const downloadRecording = () => {
    if (!lastRecording) return

    const url = URL.createObjectURL(lastRecording)
    const a = document.createElement('a')
    a.href = url
    a.download = `recording-${Date.now()}.wav`  // Changed to .wav
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[SimpleVoice] Recording downloaded')
  }

  // Test microphone without recording
  const testMicrophone = async () => {
    try {
      setIsTesting(true)
      setError(null)
      console.log('[MicTest] Starting microphone test...')

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('[MicTest] Microphone access granted')

      // Create audio analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Monitor for 5 seconds
      const monitorInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        setTestAudioLevel(average)
        console.log('[MicTest] Audio level:', average.toFixed(2))
      }, 100)

      setTimeout(() => {
        clearInterval(monitorInterval)
        stream.getTracks().forEach(track => track.stop())
        audioContext.close()
        setIsTesting(false)
        setTestAudioLevel(0)
        console.log('[MicTest] Test complete')
      }, 5000)

    } catch (error) {
      console.error('[MicTest] Failed:', error)
      setError('Microphone test failed. Please check permissions.')
      setIsTesting(false)
    }
  }

  // Disconnect/reset
  const disconnect = () => {
    stopRecording()
    setServiceType(null)
    setConversation([])
    setError(null)
    setLastRecording(null)
    setAnalysis(null)
  }

  // Save conversation script
  const saveScript = () => {
    if (conversation.length === 0) return

    const lines = conversation.map(msg => {
      const time = msg.timestamp.toLocaleTimeString()
      const role = msg.role === 'user' ? 'USER' : 'AI'
      return `[${time}] ${role}: ${msg.text}`
    }).join('\n')

    const serviceNames = {
      'pharmacy': 'Pharmacy Assistant',
      'dhl': 'DHL Tracking',
      'banking': 'Banking Assistant',
      'clinic': 'Medical Clinic Assistant'
    }
    const header = `VoiceBridge AI Conversation Transcript\nService: ${serviceNames[serviceType as keyof typeof serviceNames]}\nLanguage: ${language}\nDate: ${new Date().toLocaleDateString()}\n${'='.repeat(60)}\n\n`
    const content = header + lines

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voicebridge_transcript_${new Date().toISOString().slice(0, 10)}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Analyze transcript (client-side basic analysis)
  const analyzeTranscript = () => {
    if (conversation.length === 0) {
      setAnalysis(null)
      return
    }

    const userMessages = conversation.filter(m => m.role === 'user')
    const aiMessages = conversation.filter(m => m.role === 'ai')

    const words = (text: string) => text.split(/\s+/).filter(Boolean).length
    const userWords = userMessages.reduce((sum, m) => sum + words(m.text), 0)
    const totalWords = conversation.reduce((sum, m) => sum + words(m.text), 0)

    // Simple sentiment analysis using keyword matching
    const negativeWords = ['problem', 'issue', 'wrong', 'broken', 'bad', 'delay', 'late', 'angry', 'complaint', 'refund', 'cancel']
    const positiveWords = ['good', 'great', 'thanks', 'thank', 'excellent', 'perfect', 'appreciate', 'helpful']

    let negativeCount = 0
    let positiveCount = 0

    conversation.forEach(msg => {
      const lowerText = msg.text.toLowerCase()
      negativeCount += negativeWords.filter(word => lowerText.includes(word)).length
      positiveCount += positiveWords.filter(word => lowerText.includes(word)).length
    })

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    if (positiveCount > negativeCount + 1) sentiment = 'positive'
    else if (negativeCount > positiveCount + 1) sentiment = 'negative'

    // Generate simple summary
    const serviceLabels = {
      'pharmacy': 'pharmacy assistant',
      'dhl': 'DHL tracking system',
      'banking': 'banking assistant',
      'clinic': 'medical clinic assistant'
    }
    const summary = userMessages.length > 0
      ? `Customer interacted with ${serviceLabels[serviceType as keyof typeof serviceLabels]} in ${language} language. Total ${conversation.length} messages exchanged.`
      : 'No conversation data available.'

    // Extract potential action items (simplified)
    const actionItems: string[] = []
    if (serviceType === 'pharmacy') {
      if (conversation.some(m => m.text.toLowerCase().includes('price') || m.text.toLowerCase().includes('cost'))) {
        actionItems.push('Provide pricing information')
      }
      if (conversation.some(m => m.text.toLowerCase().includes('prescription') || m.text.toLowerCase().includes('refill'))) {
        actionItems.push('Process prescription refill')
      }
    } else if (serviceType === 'dhl') {
      if (conversation.some(m => m.text.toLowerCase().includes('track') || m.text.toLowerCase().includes('package'))) {
        actionItems.push('Provide tracking information')
      }
      if (conversation.some(m => m.text.toLowerCase().includes('delay') || m.text.toLowerCase().includes('late'))) {
        actionItems.push('Investigate delivery delay')
      }
    } else if (serviceType === 'banking') {
      if (conversation.some(m => m.text.toLowerCase().includes('balance') || m.text.toLowerCase().includes('account'))) {
        actionItems.push('Provide account balance information')
      }
      if (conversation.some(m => m.text.toLowerCase().includes('transfer') || m.text.toLowerCase().includes('send money'))) {
        actionItems.push('Process fund transfer')
      }
    } else if (serviceType === 'clinic') {
      if (conversation.some(m => m.text.toLowerCase().includes('appointment') || m.text.toLowerCase().includes('schedule'))) {
        actionItems.push('Schedule medical appointment')
      }
      if (conversation.some(m => m.text.toLowerCase().includes('doctor') || m.text.toLowerCase().includes('available'))) {
        actionItems.push('Check doctor availability')
      }
    }

    if (actionItems.length === 0) {
      actionItems.push('No specific actions identified')
    }

    setAnalysis({
      totalTurns: conversation.length,
      talkRatioUser: totalWords > 0 ? userWords / totalWords : 0,
      sentiment,
      summary,
      actionItems
    })
  }

  return (
    <section
      id="playground"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden"
    >
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
            {t.playground.title}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.playground.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-morphism rounded-3xl p-8 max-w-3xl mx-auto"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200">
              {error}
            </div>
          )}

          {!serviceType && (
            <div className="text-center space-y-6">
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-sm text-yellow-200 mb-3">
                  ⚠️ <strong>{t.playground.micTest}</strong> {t.playground.micTestBefore}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={testMicrophone}
                  disabled={isTesting}
                  className="mb-3 px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? t.playground.testMicButtonActive : t.playground.testMicButton}
                </motion.button>

                {isTesting && (
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-2">
                      {t.playground.audioLevel} {testAudioLevel.toFixed(1)} {' '}
                      {testAudioLevel < 1 ? t.playground.noSound : testAudioLevel < 10 ? t.playground.quiet : t.playground.good}
                    </div>
                    <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          testAudioLevel < 1 ? 'bg-red-500' : testAudioLevel < 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (testAudioLevel / 50) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-yellow-300 mt-2">
                      {t.playground.speakLoudly}
                    </p>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">{t.playground.chooseService}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setServiceType('pharmacy')}
                  className="p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white font-semibold text-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-5xl mb-3">💊</div>
                  <div>{t.playground.pharmacyTitle}</div>
                  <div className="text-sm opacity-80 mt-2">{t.playground.pharmacyDesc}</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setServiceType('dhl')}
                  className="p-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl text-white font-semibold text-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-5xl mb-3">📦</div>
                  <div>{t.playground.dhlTitle}</div>
                  <div className="text-sm opacity-80 mt-2">{t.playground.dhlDesc}</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setServiceType('banking')}
                  className="p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white font-semibold text-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-5xl mb-3">🏦</div>
                  <div>{t.playground.bankingTitle}</div>
                  <div className="text-sm opacity-80 mt-2">{t.playground.bankingDesc}</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setServiceType('clinic')}
                  className="p-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-5xl mb-3">🏥</div>
                  <div>{t.playground.clinicTitle}</div>
                  <div className="text-sm opacity-80 mt-2">{t.playground.clinicDesc}</div>
                </motion.button>
              </div>
            </div>
          )}

          {serviceType && (
            <>
              {/* Privacy Notice */}
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-200 text-center">
                  🔒 {t.playground.privacyNotice}
                </p>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-400">{t.playground.ready}</span>
                </div>
                <div className="flex items-center gap-2">
                  {lastRecording && (
                    <button
                      onClick={downloadRecording}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors px-2 py-1 rounded border border-primary-500/30 hover:border-primary-500"
                      title="Download last recording for debugging"
                    >
                      {t.playground.downloadRecording}
                    </button>
                  )}
                  <button
                    onClick={disconnect}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {t.playground.changeService}
                  </button>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-6 mb-6 h-96 overflow-y-auto">
                {conversation.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎤</div>
                      <p>{t.playground.clickToSpeak}</p>
                      <p className="text-sm mt-2">
                        {serviceType === 'pharmacy' && t.playground.pharmacyExample}
                        {serviceType === 'dhl' && t.playground.dhlExample}
                        {serviceType === 'banking' && t.playground.bankingExample}
                        {serviceType === 'clinic' && t.playground.clinicExample}
                      </p>
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
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-800 rounded-2xl px-4 py-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Save Script & Analyze */}
              {conversation.length > 0 && (
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveScript}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    {t.playground.saveScript}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={analyzeTranscript}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    {t.playground.analyzeTranscript}
                  </motion.button>
                </div>
              )}

              {/* Analysis Results */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-5 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl"
                >
                  <h4 className="text-lg font-bold text-purple-300 mb-4">{t.playground.analysis.title}</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/30 p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">{t.playground.analysis.totalTurns}</div>
                      <div className="text-2xl font-bold text-white">{analysis.totalTurns}</div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">{t.playground.analysis.talkRatio}</div>
                      <div className="text-2xl font-bold text-white">{(analysis.talkRatioUser * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="mb-4 bg-black/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-2">{t.playground.analysis.sentiment}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        analysis.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                        analysis.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {analysis.sentiment === 'positive' ? t.playground.analysis.positive :
                         analysis.sentiment === 'negative' ? t.playground.analysis.negative :
                         t.playground.analysis.neutral}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-300 mb-2">{t.playground.analysis.summary}</div>
                    <p className="text-sm text-gray-400">{analysis.summary}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-300 mb-2">{t.playground.analysis.actionItems}</div>
                    <ul className="space-y-1">
                      {analysis.actionItems.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isProcessing}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                    isRecording
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-xl'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRecording ? '🎙️' : '🎤'}
                </motion.button>

                <div className="text-center">
                  <div className="text-gray-400 font-medium">
                    {isProcessing && t.playground.processing}
                    {!isProcessing && isRecording && t.playground.listening}
                    {!isProcessing && !isRecording && t.playground.pressToSpeak}
                  </div>
                  {isRecording && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        {t.playground.audioLevel} {audioLevel.toFixed(1)} {audioLevel < 5 ? t.playground.speakLouder : audioLevel < 15 ? t.playground.speakUp : t.playground.good}
                      </div>
                      <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            audioLevel < 5 ? 'bg-red-500' : audioLevel < 15 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (audioLevel / 50) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {audioLevel < 5 ? t.playground.moveCloser : audioLevel < 15 ? t.playground.bitLouder : t.playground.perfect}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {serviceType === 'pharmacy' ? t.playground.pharmacyAssistant : t.playground.dhlAssistant}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1">
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
