import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Utility for conditional classnames
import { Button } from '@/components/ui/button'; // Assuming Radix-based Button component
import { Input } from '@/components/ui/input';   // Assuming Radix-based Input component

// Define interfaces for the data structures
interface Article {
  title: string;
  description: string;
  source: string;
  timeAgo: string;
  url: string;
  imageUrl: string;
  sources?: number; // Optional, for articles with multiple sources
}

// Static data for the main featured article
const featuredArticle: Article = {
  title: 'Ingram Micro blames ransomware attack for major outage since Thursday',
  description: 'SafisPay ransomware group targeted the global tech distributor\'s systems, disrupting operations and causing stock to drop 4% in premarket trading.',
  source: 'CNBC',
  timeAgo: '2h ago',
  url: 'https://www.cnbc.com/2025/07/08/ingram-micro-ransomware-attack.html',
  imageUrl: 'https://placehold.co/1200x400/2a65ba/ffffff?text=Ingram+Micro+Ransomware', // Placeholder for a large banner image
  sources: 22
};

// Static data for the smaller grid articles (reusing and adapting from previous tech news)
const gridArticles: Article[] = [
  {
    title: 'ChatGPT pilots new study together feature for students',
    description: 'The interactive mode poses questions, provides feedback.',
    source: 'The Verge',
    timeAgo: '1h ago',
    url: 'https://www.theverge.com/2025/07/08/chatgpt-study-feature',
    imageUrl: 'https://placehold.co/300x200/4a90e2/ffffff?text=ChatGPT',
    sources: 25
  },
  {
    title: 'iPhone 17 to bring Pro\'s thin bezels to all models',
    description: 'Apple will extend ultra-thin bezels across the entire iPhone 17 lineup, not just the Pro models, according to new leaks.',
    source: 'MacRumors',
    timeAgo: '2h ago',
    url: 'https://www.macrumors.com/2025/07/08/iphone-17-thin-bezels/',
    imageUrl: 'https://placehold.co/300x200/f5a623/ffffff?text=iPhone+17',
    sources: 20
  },
  {
    title: 'Huawei denies copying all Alibaba\'s AI Model',
    description: 'Huawei has issued a strong denial against claims that its new AI model is a direct copy of Alibaba\'s existing AI technology.',
    source: 'Reuters',
    timeAgo: '3h ago',
    url: 'https://www.reuters.com/technology/huawei-denies-copying-alibaba-ai-model-2025-07-08/',
    imageUrl: 'https://placehold.co/300x200/7ed321/ffffff?text=Huawei+AI',
    sources: 25
  },
  {
    title: 'New AI Model Generates Realistic 3D Objects from Text Prompts',
    description: 'A breakthrough in AI allows users to generate complex 3D models with simple text descriptions, revolutionizing design and virtual reality.',
    source: 'Ars Technica',
    timeAgo: '5h ago',
    url: 'https://arstechnica.com/science/2025/07/08/new-ai-model-generates-realistic-3d-objects-from-text-prompts/',
    imageUrl: 'https://placehold.co/300x200/9b59b6/ffffff?text=3D+AI'
  },
  {
    title: 'Cyberattack Disrupts Major Cloud Provider, Data Breach Feared',
    description: 'A significant cyberattack has caused widespread outages for a major cloud service provider, raising concerns about data security and service reliability.',
    source: 'ZDNet',
    timeAgo: '9h ago',
    url: 'https://www.zdnet.com/article/cyberattack-disrupts-major-cloud-provider-data-breach-feared/',
    imageUrl: 'https://placehold.co/300x200/e74c3c/ffffff?text=Cyberattack'
  },
  {
    title: 'Breakthrough in Solid-State Battery Technology for EVs',
    description: 'Scientists announce a major advancement in solid-state battery technology, promising longer range and faster charging for electric vehicles.',
    source: 'Electrek',
    timeAgo: '11h ago',
    url: 'https://electrek.co/2025/07/08/breakthrough-solid-state-battery-evs/',
    imageUrl: 'https://placehold.co/300x200/3498db/ffffff?text=EV+Battery'
  },
];


/**
 * The TechPage component for your Next.js application,
 * now structured like the Perplexity AI Discover page for Tech & Science.
 * It uses Radix UI components (where applicable) and generic Tailwind color classes.
 * It's a React Server Component, rendering static content with actual URLs.
 *
 * It assumes your global CSS and Tailwind config define colors like:
 * --background, --card, --input, --primary, --primary-foreground, --muted, --muted-foreground,
 * and standard Tailwind greens/reds/blues.
 */
export default function TechPage() {
  return (
    // Removed `min-h-screen` from the root div to allow scrolling from layout.tsx
    <div className="bg-background text-foreground font-inter">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Top Header Section: Discover title, horizontal navigation, and search */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <h1 className="text-3xl font-bold text-foreground">Discover</h1>
            {/* Horizontal Category Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0"> {/* Added overflow-x-auto for small screens */}
              <Button variant="ghost" className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80">Top</Button>
              <Button variant="ghost" className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80">For You</Button>
              <Button variant="default" className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium h-auto">Tech & Science</Button>
              <Button variant="ghost" className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80">Finance</Button>
              <Button variant="ghost" className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80">Arts & Culture</Button>
              <Button variant="ghost" className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80">Sports</Button>
              <Button variant="ghost" className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80">Enter</Button> {/* Placeholder for "Entertainment" or similar */}
            </div>
          </div>
          {/* Search Bar */}
          <div className="relative flex-grow w-full md:w-auto md:max-w-xs">
            <Input
              type="text"
              placeholder="Search Discover"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-input text-foreground placeholder-muted-foreground focus-visible:ring-offset-0 focus-visible:ring-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* Main Featured Article */}
        <Link href={featuredArticle.url} target="_blank" rel="noopener noreferrer" className="block mb-8">
          <div className="bg-card rounded-xl shadow-lg overflow-hidden relative group">
            {/* Image for the featured article */}
            <img
              src={featuredArticle.imageUrl}
              alt={featuredArticle.title}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 leading-tight text-foreground">
                {featuredArticle.title}
              </h2>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {featuredArticle.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{featuredArticle.source} • {featuredArticle.timeAgo}</span>
                {featuredArticle.sources && (
                  <span className="text-blue-400 cursor-pointer hover:underline">
                    {featuredArticle.sources} sources
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Grid of Smaller Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gridArticles.map((article, index) => (
            <Link href={article.url} key={index} target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                {/* Article Image */}
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 flex-grow">
                  {/* Article Title */}
                  <h3 className="text-lg font-semibold mb-2 leading-tight text-foreground line-clamp-2">
                    {article.title}
                  </h3>
                  {/* Article Description (optional, if you want to show it here) */}
                  {/* <p className="text-muted-foreground text-sm line-clamp-3 mb-2">{article.description}</p> */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.source} • {article.timeAgo}</span>
                    {article.sources && (
                      <span className="text-blue-400 cursor-pointer hover:underline">
                        {article.sources} sources
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Placeholder for more content or a "Load More" button */}
        <div className="text-center mt-8">
          <Button variant="ghost" className="px-6 py-3 rounded-full bg-muted text-muted-foreground text-base font-medium h-auto hover:bg-muted/80 transition-colors">
            Load More Tech News
          </Button>
        </div>

      </div>
    </div>
  );
}
