'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { IconLogo } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/index'

// Helper function to generate a UUID
function generateUUID(): string {
  return uuidv4()
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const AZURE_LOGIN_API_URL =
    'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/auth/login'
  const PROFILE_API_URL =
    'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/auth/me'
  const START_SESSION_API_URL =
    'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/sessions'

  useEffect(() => {
    // Check for existing session on component mount
    const accessToken = localStorage.getItem('access_token');
    const sessionId = localStorage.getItem('session_id');

    if (accessToken && sessionId) {
      // If a session already exists locally, redirect to home page
      console.log('User already logged in based on local storage. Redirecting...');
      router.push('/');
    }
  }, [router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Pre-flight check for active session before attempting login
    const existingAccessToken = localStorage.getItem('access_token');
    const existingSessionId = localStorage.getItem('session_id');

    if (existingAccessToken && existingSessionId) {
      setError('You are already logged in. Please sign out first to log in as a different user.');
      setIsLoading(false);
      console.warn('Attempted login while already authenticated. Redirecting to home.');
      router.push('/'); // Redirect to homepage if already logged in
      return;
    }

    try {
      // 1. Call login API
      const response = await fetch(AZURE_LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok && data.access_token && data.token_type === 'bearer') {
        const accessToken = data.access_token
        localStorage.setItem('access_token', accessToken)
        console.log('✅ Access Token stored:', accessToken)

        // 2. Generate and store session ID
        const sessionId = generateUUID()
        localStorage.setItem('session_id', sessionId)
        console.log(`✅ Session UUID generated and saved: ${sessionId}`)

        // 3. Fetch user profile
        const profileRes = await fetch(PROFILE_API_URL, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        })

        if (!profileRes.ok) {
          console.error('❌ Failed to fetch user profile:', profileRes.statusText)
          setError('Failed to fetch user profile. Please try again.')
          // On profile fetch failure, clear any partial login data
          localStorage.removeItem('access_token');
          localStorage.removeItem('session_id');
          localStorage.removeItem('user_id');
          setIsLoading(false)
          return
        }

        const profileData = await profileRes.json()
        const userId = profileData?.id

        if (!userId) {
          console.error('❌ User ID not found in profile data.')
          setError('User ID not found in profile. Please try again.')
          // On missing user ID, clear any partial login data
          localStorage.removeItem('access_token');
          localStorage.removeItem('session_id');
          localStorage.removeItem('user_id');
          setIsLoading(false)
          return
        }

        localStorage.setItem('user_id', userId)
        console.log('✅ User ID saved:', userId)

        // 4. Start session API
        const sessionRes = await fetch(START_SESSION_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId
          })
        })

        if (!sessionRes.ok) {
          const errRes = await sessionRes.json()
          console.error('❌ Failed to start session:', errRes)

          // --- MODIFIED HANDLING FOR 500 WITH 409 DETAIL ---
          if (
            sessionRes.status === 500 &&
            errRes?.detail &&
            typeof errRes.detail === 'string' && // Ensure detail is a string to use .includes()
            errRes.detail.includes('Active session already exists')
          ) {
            setError('An active session already exists for this user. Redirecting to home.');
            console.warn('Backend returned 500 with "Active session already exists" detail. Proceeding to redirect.');
            router.push('/'); // If backend says session exists, consider it a success and redirect
          } else {
            setError('Failed to start session. Please try again.');
          }
          // --- END MODIFIED HANDLING ---
          setIsLoading(false)
          return
        }

        console.log('✅ Session started successfully.')

        // 5. Redirect to homepage
        router.push('/')
      } else {
        const errMsg =
          data?.detail?.[0]?.msg ||
          'Login failed: Invalid credentials or unexpected response.'
        setError(errMsg)
        console.error('❌ Login API error:', data)
      }
    } catch (err: any) {
      console.error('❌ Login fetch error:', err)
      setError(
        err.message ||
          'An unexpected error occurred during login. Please check your network connection.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-6', className)} {...props}>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex flex-col items-center justify-center gap-4">
            <IconLogo className="h-16 w-16" />
            Welcome back
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  )
}

export default LoginForm