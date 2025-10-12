import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, serviceType, conversationHistory, language } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Map language codes to full language names for AI prompt
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'ar': 'Arabic',
      'es': 'Spanish',
      'fr': 'French',
      'zh': 'Chinese'
    }
    const languageName = languageMap[language || 'en'] || 'English'
    const languageInstruction = language && language !== 'en'
      ? ` IMPORTANT: Respond in ${languageName} language only. All your responses must be in ${languageName}.`
      : ''

    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: serviceType === 'pharmacy'
          ? `You are a professional pharmacy assistant helping customers with their medication needs. Your role is to: 1) Answer questions about medications (prices, availability, descriptions), 2) Help customers place orders for medications, 3) Look up existing order status, 4) Provide clear, helpful, and professional service. You have access to tools to: get_drug_info (look up medication details), place_order (create new medication orders), lookup_order (check order status by ID). IMPORTANT: ALWAYS stay in the pharmacy assistant role. If a customer asks about topics unrelated to pharmacy/medications, politely redirect them back to pharmacy services. When customers ask unclear questions, ask clarifying questions to understand their medication needs. Be concise but helpful. Never provide medical advice - only factual information about medications in the database.${languageInstruction}`
          : `You are a professional DHL package tracking assistant. Your role is to help customers track their shipments and packages. You have access to the track_shipment function. Always ask for tracking numbers in a clear format (10-14 digit numbers). Be helpful and professional.${languageInstruction}`
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: 'user',
        content: message
      }
    ]

    // Define functions for OpenAI
    const functions = serviceType === 'pharmacy'
      ? [
          {
            name: 'get_drug_info',
            description: 'Get detailed information about a specific drug including price, availability, and description.',
            parameters: {
              type: 'object',
              properties: {
                drug_name: {
                  type: 'string',
                  description: 'Name of the drug to look up. Examples: aspirin, acetaminophen'
                }
              },
              required: ['drug_name']
            }
          },
          {
            name: 'place_order',
            description: 'Place a new medication order for a customer.',
            parameters: {
              type: 'object',
              properties: {
                customer_name: {
                  type: 'string',
                  description: 'Customer\'s full name for the order'
                },
                drug_name: {
                  type: 'string',
                  description: 'Name of the drug to order'
                }
              },
              required: ['customer_name', 'drug_name']
            }
          },
          {
            name: 'lookup_order',
            description: 'Look up an existing order by its ID number.',
            parameters: {
              type: 'object',
              properties: {
                order_id: {
                  type: 'integer',
                  description: 'The order ID number to look up'
                }
              },
              required: ['order_id']
            }
          }
        ]
      : [
          {
            name: 'track_shipment',
            description: 'Track a DHL shipment using the tracking number.',
            parameters: {
              type: 'object',
              properties: {
                tracking_number: {
                  type: 'string',
                  description: 'The DHL tracking number (10-14 digits)'
                }
              },
              required: ['tracking_number']
            }
          }
        ]

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        functions,
        function_call: 'auto',
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Chat] OpenAI error:', error)
      return NextResponse.json({ error: 'AI response failed' }, { status: 500 })
    }

    const result = await response.json()
    const aiMessage = result.choices[0].message

    // Check if AI wants to call a function
    if (aiMessage.function_call) {
      console.log('[Chat] Function call requested:', aiMessage.function_call.name)

      // Get the host from the request to build the API URL
      const host = request.headers.get('host') || 'localhost:3000'
      const protocol = host.includes('localhost') ? 'http' : 'https'
      const apiUrl = `${protocol}://${host}/api/functions`

      // Call the function via our API
      const functionResult = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function_name: aiMessage.function_call.name,
          arguments: JSON.parse(aiMessage.function_call.arguments)
        })
      })

      const functionData = await functionResult.json()

      // Send function result back to OpenAI
      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...messages,
            aiMessage,
            {
              role: 'function',
              name: aiMessage.function_call.name,
              content: JSON.stringify(functionData.result)
            }
          ],
          temperature: 0.7
        })
      })

      const followUpResult = await followUpResponse.json()
      const finalMessage = followUpResult.choices[0].message.content

      return NextResponse.json({ message: finalMessage })
    }

    // No function call, return AI response directly
    return NextResponse.json({ message: aiMessage.content })
  } catch (error) {
    console.error('[Chat] Error:', error)
    return NextResponse.json({ error: 'AI response failed' }, { status: 500 })
  }
}
