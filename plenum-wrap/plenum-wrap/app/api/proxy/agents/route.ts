import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const azureApiUrl = process.env.AZURE_API_BASE_URL
    if (!azureApiUrl) {
      return NextResponse.json({ detail: 'Missing AZURE_API_BASE_URL env var' }, { status: 500 })
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ detail: 'Authorization header missing' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    // Pass query params from incoming request
    const query = req.nextUrl.search

    const res = await fetch(`${azureApiUrl}/v1/agents${query}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
