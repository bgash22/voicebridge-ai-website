import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get the host from the request to build the webhook URL
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const webhookUrl = `${protocol}://${host}/api/functions`

  // Agent configuration matching config_agent_api.json from voice_agent_app
  const config = {
    type: 'SettingsConfiguration',
    audio: {
      input: {
        encoding: 'linear16',
        sample_rate: 16000
      },
      output: {
        encoding: 'linear16',
        sample_rate: 24000,
        container: 'none',
        buffer_size: 250
      }
    },
    agent: {
      listen: {
        model: 'nova-2'
      },
      think: {
        provider: {
          type: 'open_ai'
        },
        model: 'gpt-4o-mini',
        instructions: `You are a professional assistant helping customers with pharmacy services and DHL package tracking.

Your role is to:
1) Answer questions about medications (prices, availability, descriptions)
2) Help customers place orders for medications
3) Look up existing order status
4) Track DHL shipments and packages
5) Provide clear, helpful, and professional service

You have access to tools to:
- get_drug_info: Look up medication details
- place_order: Create new medication orders
- lookup_order: Check order status by ID
- track_shipment: Track DHL packages using tracking numbers

IMPORTANT:
- ALWAYS ask users to spell out their full name clearly when placing orders
- For tracking, ask customers to provide their DHL tracking number clearly - it's usually 10-14 digit numbers only
- Confirm all order details and tracking numbers before processing
- Be thorough and professional
- Always confirm the complete details before finalizing any transaction`,
        functions: [
          {
            name: 'get_drug_info',
            url: webhookUrl,
            description: 'Get detailed information about a specific drug including price, availability, and description. Use this when customers ask about medications.',
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
            url: webhookUrl,
            description: 'Place a new medication order for a customer. Always get the customer\'s full name before placing an order.',
            parameters: {
              type: 'object',
              properties: {
                customer_name: {
                  type: 'string',
                  description: 'Customer\'s full name for the order'
                },
                drug_name: {
                  type: 'string',
                  description: 'Name of the drug to order. Must be a valid drug in our system.'
                }
              },
              required: ['customer_name', 'drug_name']
            }
          },
          {
            name: 'lookup_order',
            url: webhookUrl,
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
          },
          {
            name: 'track_shipment',
            url: webhookUrl,
            description: 'Track a DHL shipment using the tracking number (10-14 digits).',
            parameters: {
              type: 'object',
              properties: {
                tracking_number: {
                  type: 'string',
                  description: 'The DHL tracking number (10-14 digit numbers only). Examples: 1234567890, 0034029471234567'
                }
              },
              required: ['tracking_number']
            }
          }
        ]
      },
      speak: {
        model: 'aura-asteria-en'
      }
    }
  }

  console.log('[Agent Config] Webhook URL:', webhookUrl)
  return NextResponse.json(config)
}
