import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const azureApiUrl = process.env.AZURE_API_BASE_URL

    const azureRes = await fetch(`${azureApiUrl}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await azureRes.json()

    if (!azureRes.ok) {
      return NextResponse.json(data, { status: azureRes.status })
    }

    // Set access_token in an HttpOnly cookie for secure access in server routes
    const response = NextResponse.json(data)
    response.cookies.set('access_token', data.access_token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy error', details: error.message }, { status: 500 })
  }
}
