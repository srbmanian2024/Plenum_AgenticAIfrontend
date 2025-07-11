'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import {
  Plus,
  Clock,
  Cpu,
  Banknote,
  FlaskConical,
  Newspaper,
  GraduationCap,
  Dumbbell,
  Compass,
  Bot,
  ChartCandlestick,
  MapPinned,
  BookMarked,
  Star,
  User,
  Grid,
  ArrowUpRight,
  Download,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { ChatHistorySection } from './sidebar/chat-history-section'
import { ChatHistorySkeleton } from './sidebar/chat-history-skeleton'
import { IconLogo } from './ui/icons'

export default function AppSidebar() {
  const [showDiscover, setShowDiscover] = useState(false)
  const [showAgent, setShowAgent] = useState(false)

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="flex flex-row justify-between items-center">
        <Link href="/" className="flex items-center gap-2 px-2 py-3">
          <IconLogo className={cn('size-5')} />
          <span className="font-semibold text-sm">Plenum</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>

      {/* SidebarContent now correctly handles its own internal scrolling due to fixes in sidebar.tsx */}
      <SidebarContent className="flex flex-col px-2 py-4 h-full">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>New</span>
              </Link>
            </SidebarMenuButton>

            {/* <SidebarMenuButton
              onClick={() => setShowAgent(!showAgent)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Bot className="size-4" />
              <span>Agent</span>
            </SidebarMenuButton>
            {showAgent && (
              <div className="ml-6 mt-1 flex flex-col gap-1 text-sm">
                <Link href="/finance" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <ChartCandlestick className="size-4" />
                    Finance
                  </div>
                </Link>
                <Link href="/travel" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPinned className="size-4" />
                    Travel
                  </div>
                </Link>
                <Link href="/academic" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <BookMarked className="size-4" />
                    Academic
                  </div>
                </Link>
              </div>
            )}
 */}
            {/* <SidebarMenuButton
              onClick={() => setShowDiscover(!showDiscover)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Compass className="size-4" />
              <span>Domains</span>
            </SidebarMenuButton>

            {showDiscover && (
              <div className="ml-6 mt-1 flex flex-col gap-1 text-sm">
                <Link href="/tech" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4" />
                    Tech
                  </div>
                </Link>
                <Link href="/finance" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-4" />
                    Finance
                  </div>
                </Link>
                <Link href="/science" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="size-4" />
                    Science
                  </div>
                </Link>
                <Link href="/news" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <Newspaper className="size-4" />
                    News
                  </div>
                </Link>
                <Link href="/academic" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4" />
                    Academic
                  </div>
                </Link>
                <Link href="/sports" className="text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="size-4" />
                    Sports
                  </div>
                </Link>
              </div>
            )} */}
            {/* domains button */}
            <SidebarMenuButton asChild>
              <Link href="/discover" className="flex items-center gap-2">
                <Compass className="size-4" />
                <span>Discover</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Link href="/history" className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>History</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<ChatHistorySkeleton />}>
            <ChatHistorySection />
          </Suspense>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
