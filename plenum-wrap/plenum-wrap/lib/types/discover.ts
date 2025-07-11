// lib/types/discover.ts

/**
 * Represents the category (domain) of an assistant.
 * This allows 'All' as a fixed default category while supporting dynamic domain names as string.
 */
export type AssistantCategory = 'All' | string

/**
 * Optional constant for the 'All' category to avoid string repetition.
 */
export const ALL_CATEGORY: AssistantCategory = 'All'

/**
 * Optional: Type definition for an assistant.
 * Can be reused across pages or components.
 */
export type Assistant = {
  name: string
  author: string
  description: string
  category: AssistantCategory
  published: string
  stars: number
}
