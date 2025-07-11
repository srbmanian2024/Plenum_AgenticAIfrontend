import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const protocol =
    request.headers.get('x-forwarded-proto') || request.nextUrl.protocol

  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || ''

  const baseUrl = `${protocol}${protocol.endsWith(':') ? '//' : '://'}${host}`

  const url = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Example protected route logic
  const isProtectedRoute =
    url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/profile')

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const response = NextResponse.next()
  response.headers.set('x-url', request.url)
  response.headers.set('x-host', host)
  response.headers.set('x-protocol', protocol)
  response.headers.set('x-base-url', baseUrl)

  return response
}
export const config = {
  matcher: [
    /*
      Match all paths except:
      - /_next/*
      - /favicon.ico
      - static file extensions
    */
    '/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|json|txt|js|css|map)).*)',
  ],
}
export default middleware
 