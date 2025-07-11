import { Button } from '@/components/ui/button' // Assuming Radix-based Button component
import { Input } from '@/components/ui/input' // Assuming Radix-based Input component
import { cn } from '@/lib/utils' // Utility for conditional classnames
import Link from 'next/link'

// Define interfaces for the data structures, adapted for tech content
interface TechCompany {
  name: string
  ticker: string // Or a short identifier
  value: string // e.g., Market Cap, Valuation
  change: string
  changeType: 'up' | 'down' | 'neutral' // For coloring the change
  url: string
}

interface TechTrend {
  name: string
  value: string // e.g., Growth Rate, Investment
  change: string
  changeType: 'up' | 'down' | 'neutral'
  url: string
}

interface TechSummarySection {
  title: string
  content: string
  sources?: number // Optional, for "sources" count
}

interface TechNewsArticle {
  title: string
  source: string
  timeAgo: string
  url: string
  imageUrl: string // For the thumbnail
}

interface TrendingTopic {
  title: string
  sources: number
  url: string
}

interface TechCategory {
  name: string
  value: string // e.g., market size, investment
}

// Static data mimicking the finance page structure, but with tech content
const topTechCompanies: TechCompany[] = [
  {
    name: 'Microsoft Corp',
    ticker: 'MSFT',
    value: '$3.1T',
    change: '+0.81%',
    changeType: 'up',
    url: 'https://www.microsoft.com/en-us/investor'
  },
  {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    value: '$3.0T',
    change: '-0.25%',
    changeType: 'down',
    url: 'https://investor.apple.com/investor-relations/'
  },
  {
    name: 'NVIDIA Corp',
    ticker: 'NVDA',
    value: '$2.9T',
    change: '+1.50%',
    changeType: 'up',
    url: 'https://investor.nvidia.com/home/default.aspx'
  },
  {
    name: 'Amazon.com, Inc.',
    ticker: 'AMZN',
    value: '$2.1T',
    change: '+0.01%',
    changeType: 'up',
    url: 'https://ir.aboutamazon.com/'
  },
  {
    name: 'Alphabet Inc.',
    ticker: 'GOOGL',
    value: '$1.9T',
    change: '-0.02%',
    changeType: 'down',
    url: 'https://abc.xyz/investor/'
  },
  {
    name: 'Meta Platforms, Inc.',
    ticker: 'META',
    value: '$1.2T',
    change: '+0.09%',
    changeType: 'up',
    url: 'https://investor.fb.com/'
  },
  {
    name: 'Tesla, Inc.',
    ticker: 'TSLA',
    value: '$580B',
    change: '+0.50%',
    changeType: 'up',
    url: 'https://ir.tesla.com/'
  },
  {
    name: 'TSMC',
    ticker: 'TSM',
    value: '$750B',
    change: '+0.70%',
    changeType: 'up',
    url: 'https://www.tsmc.com/english/investorRelations'
  },
  {
    name: 'Samsung Electronics',
    ticker: 'SMSN',
    value: '$450B',
    change: '-0.15%',
    changeType: 'down',
    url: 'https://www.samsung.com/global/ir/'
  }
]

const techTrends: TechTrend[] = [
  {
    name: 'AI Investment',
    value: '$250B',
    change: '+15%',
    changeType: 'up',
    url: 'https://www.pwc.com/gx/en/issues/ai/ai-predictions-2024.html'
  },
  {
    name: 'Quantum Computing Progress',
    value: '$10B',
    change: '+8%',
    changeType: 'up',
    url: 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/quantum-computing-what-it-is-and-how-it-could-change-the-world'
  },
  {
    name: 'Cybersecurity Market',
    value: '$200B',
    change: '+10%',
    changeType: 'up',
    url: 'https://www.statista.com/statistics/1271109/cybersecurity-market-size-worldwide/'
  },
  {
    name: 'Web3 Adoption',
    value: '$50B',
    change: '+5%',
    changeType: 'up',
    url: 'https://www.grandviewresearch.com/industry-analysis/web-3-market'
  }
]

const techSummarySections: TechSummarySection[] = [
  {
    title: 'AI Dominance in Tech Sector Continues',
    content:
      'Artificial Intelligence remains the leading force in technological innovation, with significant investments pouring into generative AI, machine learning, and autonomous systems. Companies are increasingly integrating AI into core products, driving efficiency and new capabilities across industries.'
  },
  {
    title: 'Semiconductor Industry Navigates Geopolitical Shifts',
    content:
      'The global semiconductor market faces ongoing challenges from supply chain disruptions and geopolitical tensions. Despite this, demand for advanced chips continues to rise, fueled by AI, 5G, and automotive sectors, pushing manufacturers to expand production and innovate.'
  },
  {
    title: 'Sustainable Tech Solutions Gain Traction',
    content:
      "Growing environmental concerns are accelerating the adoption of sustainable technology. Innovations in green data centers, energy-efficient hardware, and renewable energy integration are becoming central to tech companies' strategies, aiming to reduce carbon footprints.",
    sources: 12
  },
  {
    title: 'Cybersecurity Threats Evolve with AI Integration',
    content:
      'As AI becomes more pervasive, so do the sophistication of cyber threats. New AI-powered attack vectors are emerging, prompting a rapid evolution in cybersecurity defenses, with a focus on proactive threat intelligence and adaptive security frameworks.',
    sources: 15
  }
]

const latestTechNews: TechNewsArticle[] = [
  {
    title: 'Google Unveils New Quantum Processor "Sycamore X"',
    source: 'TechCrunch',
    timeAgo: '1h ago',
    url: 'https://techcrunch.com/2025/07/08/google-unveils-new-quantum-processor-sycamore-x/',
    imageUrl: 'https://placehold.co/80x64/2a65ba/ffffff?text=Quantum'
  },
  {
    title: 'Microsoft Invests Billions in AI Supercomputing Infrastructure',
    source: 'The Verge',
    timeAgo: '3h ago',
    url: 'https://www.theverge.com/2025/07/08/microsoft-ai-supercomputing-investment',
    imageUrl: 'https://placehold.co/80x64/2a65ba/ffffff?text=MSFT'
  },
  {
    title: 'New AI Model Generates Realistic 3D Objects from Text Prompts',
    source: 'Ars Technica',
    timeAgo: '5h ago',
    url: 'https://arstechnica.com/science/2025/07/08/new-ai-model-generates-realistic-3d-objects-from-text-prompts/',
    imageUrl: 'https://placehold.co/80x64/2a65ba/ffffff?text=3D AI'
  },
  {
    title: 'Apple Patents Foldable Display Technology for Future Devices',
    source: 'MacRumors',
    timeAgo: '7h ago',
    url: 'https://www.macrumors.com/2025/07/08/apple-patents-foldable-display-technology/',
    imageUrl: 'https://placehold.co/80x64/2a65ba/ffffff?text=Apple'
  },
  {
    title: 'Cyberattack Disrupts Major Cloud Provider, Data Breach Feared',
    source: 'ZDNet',
    timeAgo: '9h ago',
    url: 'https://www.zdnet.com/article/cyberattack-disrupts-major-cloud-provider-data-breach-feared/',
    imageUrl: 'https://placehold.co/80x64/2a65ba/ffffff?text=Cyber'
  },
  {
    title: 'Breakthrough in Solid-State Battery Technology for EVs',
    source: 'Electrek',
    timeAgo: '11h ago',
    url: 'https://electrek.co/2025/07/08/breakthrough-solid-state-battery-evs/',
    imageUrl: 'https://placehold.co/80x64/2a65ba/ffffff?text=EV Tech'
  }
]

const trendingTopics: TrendingTopic[] = [
  {
    title: 'The Future of AI Ethics and Regulation',
    sources: 28,
    url: 'https://www.brookings.edu/topics/ai-ethics/'
  },
  {
    title: 'Impact of Quantum Computing on Cryptography',
    sources: 19,
    url: 'https://www.nist.gov/news-events/news/2023/07/nist-releases-first-four-quantum-resistant-cryptographic-algorithms'
  },
  {
    title: 'Advancements in Robotics and Automation',
    sources: 22,
    url: 'https://www.robotics.org/blog/2024/01/01/top-robotics-trends-to-watch-in-2024'
  },
  {
    title: 'Decentralized Identity Solutions in Web3',
    sources: 14,
    url: 'https://www.coindesk.com/learn/what-is-decentralized-identity/'
  },
  {
    title: 'Sustainable Practices in Data Center Management',
    sources: 16,
    url: 'https://www.datacenterdynamics.com/en/news/the-rise-of-sustainable-data-centers/'
  },
  {
    title: 'The Evolution of Brain-Computer Interfaces',
    sources: 17,
    url: 'https://www.nature.com/articles/d41586-023-02484-9'
  }
]

const techCategories: TechCategory[] = [
  { name: 'Artificial Intelligence', value: '$254.97B' },
  { name: 'Cloud Computing', value: '$88.10B' },
  { name: 'Semiconductors', value: '$112.45B' },
  { name: 'Software Development', value: '$170.00B' },
  { name: 'Biotechnology', value: '$107.00B' },
  { name: 'Robotics', value: '$148.90B' },
  { name: 'Cybersecurity', value: '$95.00B' },
  { name: 'Quantum Technology', value: '$15.00B' }
]

/**
 * The TechPage component for your Next.js application,
 * now structured like the Perplexity AI Finance page.
 * It uses Radix UI components (where applicable) and generic Tailwind color classes.
 * It's a React Server Component, rendering static content with actual URLs.
 *
 * It assumes your global CSS and Tailwind config define colors like:
 * --background, --card, --input, --primary, --primary-foreground, --muted, --muted-foreground,
 * and standard Tailwind greens/reds/blues.
 */
export default function TechPage() {
  return (
    // FIX: Removed `min-h-screen` from the root div.
    // The `main` element in layout.tsx is responsible for scrolling.
    <div className="bg-background text-foreground font-inter">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">Tech & Science</h1>
            {/* Category tabs matching Perplexity's style */}
            <div className="flex space-x-2">
              <Button
                variant="default"
                className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium h-auto"
              >
                All Tech
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80"
              >
                AI
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80"
              >
                Cloud
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80"
              >
                Hardware
              </Button>
            </div>
          </div>
          {/* Share button matching Perplexity's style */}
          <Button className="flex items-center gap-1 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium h-auto hover:bg-primary/80 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.516 3.91M12 21a9 9 0 110-18 9 9 0 010 18zm-4.684-2.658C6.114 17.062 6 16.518 6 16c0-.518.114-.962.316-1.342m0 2.684a3 3 0 110-2.684"
              ></path>
            </svg>
            Share
          </Button>
        </div>

        {/* Search Bar and Action Button */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-grow w-full">
            <Input
              type="text"
              placeholder="Search for technologies, trends, news, and more"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-input text-foreground placeholder-muted-foreground focus-visible:ring-offset-0 focus-visible:ring-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
          <Button className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium h-auto hover:bg-muted/80 transition-colors w-full md:w-auto">
            Create Tech Feed
          </Button>
        </div>

        {/* Tech Trends / Quick Stats (equivalent to Market Indices) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {techTrends.map((trend, i) => (
            <Link
              href={trend.url}
              key={i}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="bg-card rounded-xl shadow-lg p-4 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow duration-300">
                <p className="text-sm text-muted-foreground mb-1">
                  {trend.name}
                </p>
                <p className="text-xl font-bold mb-1">{trend.value}</p>
                <p
                  className={cn(
                    'text-sm',
                    trend.changeType === 'up' && 'text-green-400',
                    trend.changeType === 'down' && 'text-red-400',
                    trend.changeType === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {trend.change}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content Grid (Tech Summary & Latest News vs. Top Companies & Categories) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tech Summary & Latest News */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tech Industry Summary */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Tech Industry Summary
              </h2>
              {techSummarySections.map((section, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {section.content}
                    {section.sources && (
                      <span className="text-blue-400 ml-2 cursor-pointer">
                        {section.sources} sources
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Latest Tech News */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Latest News</h2>
              <div className="space-y-4">
                {latestTechNews.map((article, index) => (
                  <Link
                    href={article.url}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start hover:bg-muted p-2 rounded-lg transition-colors -mx-2"
                  >
                    <div className="w-20 h-16 bg-muted rounded-lg flex-shrink-0 mr-4 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1 leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {article.source} <span className="mx-1">•</span>{' '}
                        {article.timeAgo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="#"
                  className="text-blue-400 text-sm font-medium hover:underline"
                >
                  Load More News
                </Link>
              </div>
            </div>

            {/* Additional Tech Content Section (e.g., Emerging Technologies) */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Emerging Technologies
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestTechNews.slice(0, 4).map((tech, index) => (
                  <Link
                    href={tech.url}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors">
                      <p className="text-sm text-muted-foreground mb-1">
                        {tech.title}
                      </p>
                      <p className="text-foreground text-xs line-clamp-2">
                        {tech.source} <span className="mx-1">•</span>{' '}
                        {tech.timeAgo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Top Companies, Trending Topics, Tech Categories */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Tech Companies */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Top Tech Companies</h2>
              <div className="space-y-4">
                {topTechCompanies.map((company, index) => (
                  <Link
                    href={company.url}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center space-x-3">
                        {/* Placeholder for company logo/icon */}
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                          {company.ticker.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {company.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {company.ticker}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {company.value}
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            company.changeType === 'up' && 'text-green-400',
                            company.changeType === 'down' && 'text-red-400',
                            company.changeType === 'neutral' &&
                              'text-muted-foreground'
                          )}
                        >
                          {company.change}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Tech Topics */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Trending Topics</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium h-auto"
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium h-auto hover:bg-muted/80"
                  >
                    Week
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium h-auto hover:bg-muted/80"
                  >
                    Month
                  </Button>
                </div>
              </div>
              <ul className="space-y-3">
                {trendingTopics.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:underline text-blue-400 text-sm font-medium"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {item.sources} sources
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Categories */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Tech Categories</h2>
              <div className="space-y-3">
                {techCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <p className="text-muted-foreground font-medium">
                      {category.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {category.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
