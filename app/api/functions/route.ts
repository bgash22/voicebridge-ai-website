import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory database for demonstration
let orders_db: Record<number, any> = {}
let next_order_id = 1
let shipments_db: Record<string, any> = {}

const drugs = {
  acetaminophen: {
    name: 'Acetaminophen',
    price: 6.99,
    quantity: 25,
    description: 'An analgesic and antipyretic medication used for pain and fever control.'
  },
  aspirin: {
    name: 'Aspirin',
    price: 4.5,
    quantity: 100,
    description: 'Commonly used for mild to moderate pain relief, inflammation, and fever.'
  }
}

// Pharmacy Functions
function get_drug_info(drug_name: string) {
  const drug = drugs[drug_name.toLowerCase() as keyof typeof drugs]
  if (drug) {
    return drug
  }
  return { error: `Could not find information for ${drug_name}.` }
}

function place_order(customer_name: string, drug_name: string) {
  const drug_info = get_drug_info(drug_name)
  if ('error' in drug_info) {
    return drug_info
  }

  const order = {
    order_id: next_order_id,
    customer_name,
    drug_name,
    status: 'pending'
  }
  orders_db[next_order_id] = order
  next_order_id += 1
  return order
}

function lookup_order(order_id: number) {
  const order = orders_db[order_id]
  if (order) {
    return order
  }
  return { error: `Could not find order with ID ${order_id}.` }
}

// DHL Functions
function track_shipment(tracking_number: string) {
  // Clean up tracking number (remove spaces, dashes, keep only digits)
  const cleaned_tracking = tracking_number.replace(/[^0-9]/g, '')

  if (!cleaned_tracking) {
    return { error: 'Invalid tracking number provided.' }
  }

  // Mock tracking response for demo purposes
  if (cleaned_tracking.startsWith('00') || cleaned_tracking.length >= 10) {
    return {
      tracking_number: cleaned_tracking,
      status: 'Package in transit. Expected delivery in 2-3 business days.',
      source: 'Mock Tracking (Demo)'
    }
  } else {
    return {
      tracking_number: cleaned_tracking,
      status: 'Tracking number not found or invalid format.',
      source: 'Mock Tracking (Demo)'
    }
  }
}

// Function dispatcher
const function_map: Record<string, Function> = {
  get_drug_info,
  place_order,
  lookup_order,
  track_shipment
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { function_name, arguments: args } = body

    console.log('[Functions API] Executing:', function_name, 'with args:', args)

    if (!function_map[function_name]) {
      return NextResponse.json(
        { error: `Unknown function: ${function_name}` },
        { status: 400 }
      )
    }

    // Execute the function
    const result = function_map[function_name](...Object.values(args))

    console.log('[Functions API] Result:', result)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('[Functions API] Error:', error)
    return NextResponse.json(
      { error: 'Function execution failed' },
      { status: 500 }
    )
  }
}
