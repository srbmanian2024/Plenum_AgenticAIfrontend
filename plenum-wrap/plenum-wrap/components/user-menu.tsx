'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
// import { createClient } from '@/lib/supabase/client' // Remove if not using Supabase auth
import { User } from '@supabase/supabase-js' // Keep if User type is still useful for props
import { Link2, LogOut, Palette } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ExternalLinkItems } from './external-link-items'
import { ThemeMenuItems } from './theme-menu-items'
import { Button } from './ui/button'
import { useState } from 'react' // Import useState

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false) // To disable button during sign-out

  const userName =
    user.user_metadata?.full_name || user.user_metadata?.name || 'User'
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture

  const END_SESSION_API_URL_BASE =
    'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/sessions'

  const getInitials = (name: string, email: string | undefined) => {
    if (name && name !== 'User') {
      const names = name.split(' ')
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.split('@')[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const handleLogout = async () => {
    setIsLoading(true)
    const sessionId = localStorage.getItem('session_id')
    const accessToken = localStorage.getItem('access_token')

    const cleanupAndRedirect = () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('session_id')
      localStorage.removeItem('user_id')
      setIsLoading(false)
      router.push('/auth/login') // Redirect to login page after sign out
      router.refresh() // Refresh the router to ensure state updates
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
          const errorData = await response.json();
          if (
            (response.status === 500 && errorData?.detail && typeof errorData.detail === 'string' && errorData.detail.includes('Session not found')) ||
            response.status === 404
          ) {
            console.warn('⚠️ Session not found on backend (or 500 with 404 detail). It might have already expired or been ended elsewhere. Proceeding with client-side logout.');
          } else {
            console.error('❌ Failed to end session:', errorData);
          }
        }
      } catch (error) {
        console.error('❌ Error during logout API call:', error)
      } finally {
        cleanupAndRedirect();
      }
    } else {
      console.warn('⚠️ No session ID or access token found locally. Proceeding with client-side logout.')
      cleanupAndRedirect();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled={isLoading}> {/* Disable button when loading */}
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>{getInitials(userName, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {userName}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}