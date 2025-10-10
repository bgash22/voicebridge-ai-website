import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[Transcribe] Received request')

    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob

    if (!audioFile) {
      console.error('[Transcribe] No audio file in request')
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('[Transcribe] Audio file size:', audioFile.size, 'bytes, type:', audioFile.type)

    // Check if audio file is too small (likely empty/silent)
    if (audioFile.size < 1000) {
      console.error('[Transcribe] Audio file too small, likely empty or silent')
      return NextResponse.json({
        error: 'Audio too short or silent',
        transcript: ''
      }, { status: 400 })
    }

    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      console.error('[Transcribe] API key not found in environment')
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 })
    }

    console.log('[Transcribe] Sending to Deepgram...')

    // Convert blob to buffer for better handling
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Detect content type from the blob
    let contentType = audioFile.type || 'audio/wav'

    console.log('[Transcribe] Content-Type:', contentType)

    // Build Deepgram URL - let Deepgram auto-detect format
    const deepgramParams = new URLSearchParams({
      model: 'nova-2',
      smart_format: 'true',
      language: 'en',
      punctuate: 'true'
      // Remove encoding/sample_rate - let Deepgram auto-detect from file
    })

    const deepgramUrl = `https://api.deepgram.com/v1/listen?${deepgramParams.toString()}`
    console.log('[Transcribe] Deepgram URL:', deepgramUrl)

    // Send audio to Deepgram for transcription
    const response = await fetch(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': contentType
      },
      body: buffer
    })

    console.log('[Transcribe] Deepgram response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('[Transcribe] Deepgram error:', error)
      return NextResponse.json({
        error: 'Transcription failed',
        details: error,
        status: response.status
      }, { status: 500 })
    }

    const result = await response.json()
    console.log('[Transcribe] Deepgram result:', JSON.stringify(result))

    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence

    console.log('[Transcribe] Transcript:', transcript, 'Confidence:', confidence)

    if (!transcript || transcript.trim() === '') {
      console.error('[Transcribe] Empty transcript - audio may be silent or too short')
      return NextResponse.json({
        error: 'No speech detected',
        transcript: '',
        message: 'No speech was detected in the audio. Please try speaking louder and longer.'
      }, { status: 400 })
    }

    console.log('[Transcribe] Success:', transcript)

    return NextResponse.json({ transcript, confidence })
  } catch (error) {
    console.error('[Transcribe] Exception:', error)
    return NextResponse.json({
      error: 'Transcription failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
