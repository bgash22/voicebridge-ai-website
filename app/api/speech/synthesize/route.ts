import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 })
    }

    // Send text to Deepgram for speech synthesis
    const response = await fetch(
      'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[Synthesize] Deepgram error:', error)
      return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 500 })
    }

    // Return the audio stream
    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      }
    })
  } catch (error) {
    console.error('[Synthesize] Error:', error)
    return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 500 })
  }
}
