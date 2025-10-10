import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse request body for service type (optional)
    const body = await request.json()
    const { serviceType } = body

    console.log('[API] Generating WebSocket URL for service:', serviceType || 'default')

    // Connect to local Python voice agent backend
    // This connects to your existing main.py voice agent
    const wsUrl = `ws://localhost:7070/twiml/stream`

    console.log('[API] Generated WebSocket URL for local voice agent')

    return NextResponse.json({
      wsUrl,
      serviceType: serviceType || 'pharmacy'
    })
  } catch (error) {
    console.error('[API] Failed to generate agent connection:', error)
    return NextResponse.json(
      { error: 'Failed to connect to agent. Please try again.' },
      { status: 500 }
    )
  }
}
