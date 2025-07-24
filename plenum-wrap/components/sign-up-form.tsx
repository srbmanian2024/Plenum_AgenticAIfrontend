'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { IconLogo } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/index'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Corrected API URL based on your login and session APIs
  const REGISTER_API_URL =
    'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/auth/register'

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(
        REGISTER_API_URL, // Use the corrected API URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            username,
            emailaddress: email, // Ensure this matches your API's expected field name
            password,
            role: 'user', // Assuming 'user' is the default role for sign-up
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        // Handle specific error messages from the API
        if (data.detail && Array.isArray(data.detail) && data.detail.length > 0) {
          // If 'detail' is an array of validation errors
          const errorMessages = data.detail.map((err: any) => err.msg).join(', ');
          throw new Error(errorMessages);
        } else if (data.detail && typeof data.detail === 'string') {
          // If 'detail' is a single string error message
          throw new Error(data.detail);
        } else {
          // Fallback for unexpected error structures
          throw new Error(`Registration failed with status: ${res.status}`);
        }
      }

      // If registration is successful, redirect to a success page or login page
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      console.error('Sign up error:', error); // Log the error for debugging
      setError(error instanceof Error ? error.message : 'An unexpected error occurred during sign up.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-6', className)} {...props}>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex flex-col items-center justify-center gap-4">
            <IconLogo className="h-40 w-40" />
            Create an account
          </CardTitle>
          <CardDescription>Enter your details below to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repeat-password">Repeat Password</Label>
              <Input
                id="repeat-password"
                type="password"
                placeholder="********"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign In
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

export default SignUpForm
