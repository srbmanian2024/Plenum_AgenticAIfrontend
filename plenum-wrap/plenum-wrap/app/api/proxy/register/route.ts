import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('🟨 Incoming login body from frontend:', body)

    const azureUrl = process.env.AZURE_API_BASE_URL
    if (!azureUrl) throw new Error('AZURE_API_BASE_URL is not defined')

    console.log('🌐 Azure API URL:', azureUrl)

    const azureRes = await fetch(`${azureUrl}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await azureRes.json()

    if (!azureRes.ok) {
      console.error('❌ Azure API returned error:', data)
      return NextResponse.json(data, { status: azureRes.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
