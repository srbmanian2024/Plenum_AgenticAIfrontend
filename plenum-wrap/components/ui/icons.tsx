// 'use client'

// import { cn } from '@/lib/utils'
// import Logo from '@/public/images/plenum_logo.png'
// function IconLogo({ className, ...props }: React.ComponentProps<'svg'>) {
//   return (
//     <svg
//       fill="currentColor"
//       viewBox="0 0 256 256"
//       role="img"
//       xmlns="http://www.w3.org/2000/svg"
//       className={cn('h-4 w-4', className)}
//       {...props}
//     >
//       <circle cx="128" cy="128" r="128" fill="black"></circle>
//       <circle cx="102" cy="128" r="18" fill="white"></circle>
//       <circle cx="154" cy="128" r="18" fill="white"></circle>
//     </svg>
//   )
// }

// export { IconLogo }


'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image' // Import the Image component from Next.js
import Logo from '@/public/images/plenum_logo.png' // Your imported image

function IconLogo({
  className,
  alt = 'Plenum Logo',
  ...props
}: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> & { className?: string; alt?: string }) {
  return (
    <Image
      src={Logo}
      alt={alt}
      className={cn('h-4 w-4', className)}
      {...props}
    />
  )
}

export { IconLogo }