'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Link2,
  LogIn,
  LogOut, // Import LogOut icon
  Palette,
  Settings2
} from 'lucide-react'
import { ExternalLinkItems } from './external-link-items'
import { ThemeMenuItems } from './theme-menu-items'

export default function GuestMenu() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // To disable button during sign-out
  const router = useRouter()

  const END_SESSION_API_URL_BASE =
    'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/sessions'

  useEffect(() => {
    // Check if access_token and session_id exist in localStorage
    const accessToken = localStorage.getItem('access_token')
    const sessionId = localStorage.getItem('session_id')
    setIsAuthenticated(!!accessToken && !!sessionId) // Set true if both exist
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    const sessionId = localStorage.getItem('session_id')
    const accessToken = localStorage.getItem('access_token')

    // Always clear local storage at the end, regardless of API response
    // This ensures client-side state is always logged out after a sign-out attempt
    const cleanupAndRedirect = () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('session_id')
      localStorage.removeItem('user_id')
      setIsAuthenticated(false)
      setIsLoading(false)
      router.push('/auth/login') // Redirect to login page after sign out
      router.refresh(); // <--- ADDED: Refresh the page after redirect
    };

    if (sessionId && accessToken) {
      try {
        const response = await fetch(`${END_SESSION_API_URL_BASE}/${sessionId}/end`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        })

        if (response.ok) {
          console.log('✅ Session ended successfully on backend.')
        } else {
          const errorData = await response.json(); // Attempt to parse error data
          // Specific handling for 500 with 404 detail, or just a 404
          if (
            (response.status === 500 && errorData?.detail && typeof errorData.detail === 'string' && errorData.detail.includes('Session not found')) ||
            response.status === 404
          ) {
            console.warn('⚠️ Session not found on backend (or 500 with 404 detail). It might have already expired or been ended elsewhere. Proceeding with client-side logout.');
          } else {
            console.error('❌ Failed to end session:', errorData);
            // You might want to display a temporary error message to the user here
          }
        }
      } catch (error) {
        console.error('❌ Error during sign out API call:', error)
        // You might want to display a temporary error message to the user here
      } finally {
        cleanupAndRedirect(); // Always clean up and redirect in finally block
      }
    } else {
      // If no session ID or token was found locally, just clean up and redirect
      console.warn('⚠️ No session ID or access token found locally. Proceeding with client-side logout.')
      cleanupAndRedirect();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {isAuthenticated ? (
          <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Sign In</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ThemeMenuItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Link2 className="mr-2 h-4 w-4" />
            <span>Links</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ExternalLinkItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}