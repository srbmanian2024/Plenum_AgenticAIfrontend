'use client'

import { Skeleton } from './ui/skeleton'

export const DefaultSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 pb-4 pt-2">
      {[...Array(2)].map((_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 pb-0.5">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.5rem)]"
        >
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  )
}
