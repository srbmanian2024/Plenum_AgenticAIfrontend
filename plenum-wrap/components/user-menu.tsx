/* eslint-disable react/jsx-no-undef */
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
// Removed Supabase import as we're no longer using its auth for logout
// import { createClient } from '@/lib/supabase/client'
// Removed Supabase User type, will use a generic User type or infer from localStorage
import { Link2, LogOut, Palette } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ExternalLinkItems } from './external-link-items' // Assuming this path is correct
import { ThemeMenuItems } from './theme-menu-items' // Assuming this path is correct
import { Button } from './ui/button' // Assuming this path is correct
import { useEffect, useState } from 'react'
import { toast } from 'sonner' // For showing notifications
import { Spinner } from './ui/spinner'

// Define a simpler User type based on what you store in localStorage or what's sufficient for display
interface User {
  id: string; // user_id from localStorage
  email?: string; // from localStorage or fetched profile
  full_name?: string; // from localStorage or fetched profile
  name?: string; // from localStorage or fetched profile
  avatar_url?: string; // from localStorage or fetched profile
  picture?: string; // from localStorage or fetched profile
  // Add other properties you might store or need for display
}

interface UserMenuProps {
  // We will now load user data from localStorage in the component
  // to avoid passing it directly, making it more flexible with your custom auth.
  // However, if you have a way to securely pass user from a server component, keep it.
  // For this example, assuming you *might* not have a direct 'User' object like Supabase's.
  // If you always pass a 'User' object here after auth, you can keep the original `user: User` prop.
  // For now, let's make it optional and load internally if not provided for flexibility.
  user?: User;
}

export default function UserMenu({ user: propUser }: UserMenuProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const END_SESSION_API_BASE_URL = 'https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/v1/sessions';

  useEffect(() => {
    // Load user data from localStorage
    if (propUser) {
      setCurrentUser(propUser);
    } else if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id');
      const storedEmail = localStorage.getItem('user_email'); // Assuming you store this
      const storedUsername = localStorage.getItem('username'); // Assuming you store this
      // You might also fetch the full profile with the access_token if needed here
      // For simplicity, using what's available
      if (storedUserId) {
        setCurrentUser({
          id: storedUserId,
          email: storedEmail || undefined,
          full_name: storedUsername || undefined, // Using username as full_name for display
          name: storedUsername || undefined,
          // avatar_url and picture would need to be stored or fetched
        });
      }
    }
  }, [propUser]);

  const userName =
    currentUser?.full_name || currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const avatarUrl =
    currentUser?.avatar_url || currentUser?.picture; // Assuming these might be stored

  const getInitials = (name: string, email: string | undefined) => {
    if (name && name !== 'User') {
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.split('@')[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const sessionId = localStorage.getItem('session_id');
    const accessToken = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id'); // Get userId for logging if needed

    if (!sessionId || !accessToken) {
      console.warn('No session ID or access token found in local storage. Proceeding with client-side clear.');
      toast.info('No active session found. Logging out locally.');
    } else {
      try {
        const response = await fetch(`${END_SESSION_API_BASE_URL}/${sessionId}/end`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          console.log(`✅ Session ${sessionId} ended successfully on backend.`);
          toast.success('Logged out successfully.');
        } else {
          const errorData = await response.json();
          console.error('❌ Failed to end session on backend:', response.status, errorData);
          toast.error(`Failed to log out: ${errorData.detail || 'Server error'}`);
          // Decide if you want to proceed with local clear even if backend fails
          // For now, we proceed to ensure local state is cleared.
        }
      } catch (error) {
        console.error('❌ Network error while trying to end session:', error);
        toast.error('Network error during logout. Please check your connection.');
        // Proceed with local clear
      }
    }

    // Clear all relevant items from local storage regardless of backend response
    localStorage.removeItem('access_token');
    localStorage.removeItem('session_id');
    localStorage.removeItem('user_id'); // Clear user_id too upon full logout
    localStorage.removeItem('user_email'); // Clear if you stored it
    localStorage.removeItem('username'); // Clear if you stored it
    setCurrentUser(null); // Clear current user state

    // Dispatch a custom event to notify other parts of the app (e.g., chat history)
    // that the user has logged out and relevant data should be cleared/reloaded.
    window.dispatchEvent(new CustomEvent('user-logged-out'));
    window.dispatchEvent(new CustomEvent('chat-history-updated')); // To clear chat history in sidebar

    router.push('/sign-in'); // Redirect to login page
    router.refresh(); // Forces a refresh to ensure server components also reset
    setIsLoggingOut(false);
  };

  // Only render the menu if there is a current user
  if (!currentUser) {
    return null; // Or a skeleton/placeholder if desired
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled={isLoggingOut}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>{getInitials(userName, currentUser.email)}</AvatarFallback>
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
              {currentUser.email || 'N/A'}
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
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <div className="flex items-center">
              <Spinner className="mr-2 h-4 w-4" /> {/* Assuming Spinner component */}
              Logging out...
            </div>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}