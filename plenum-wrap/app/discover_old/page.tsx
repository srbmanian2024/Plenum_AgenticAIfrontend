'use client'

import { useState } from 'react'
import { useCategory } from '@/lib/hooks/useCategory' // Keep your existing hook
import { AssistantCategory } from '@/lib/types/discover' // Keep your existing enum
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input' // Import Input for the search bar
import { Search, Github, UserPlus } from 'lucide-react' // Import icons for search and GitHub (assuming you use lucide-react)
import { cn } from '@/lib/utils'

// Mock Assistant Data - REPLACE THIS WITH YOUR ACTUAL DATA FETCHING
// This is necessary to have content to search and display realistically.
const assistantsData = [
  {
    name: 'Academic Writing Assistant',
    author: 'swarfte',
    description: 'Expert in academic research paper writing and formal documentation.',
    category: AssistantCategory.Academic,
    published: 'Jun 17, 2025',
    stars: 314,
  },
  {
    name: 'Academic Paper Reading Mentor',
    author: 'AdijeShen',
    description: 'Expert in explaining complex academic papers in simple and understandable language.',
    category: AssistantCategory.Academic,
    published: 'May 09, 2025',
    stars: 958,
  },
  {
    name: 'Academic Paper Review Expert',
    author: 'arvinxx',
    description: 'An academic research assistant skilled in high-quality literature retrieval and analysis.',
    category: AssistantCategory.Academic,
    published: 'Mar 11, 2025',
    stars: 1012,
  },
  {
    name: 'Deep Thinker',
    author: 'prolapser',
    description: 'Deep, human-like thinking and analysis.',
    category: AssistantCategory.Academic, // Or another relevant category
    published: 'Feb 06, 2025',
    stars: 858,
  },
  {
    name: 'Summsi',
    author: '42lux',
    description: 'Expert in text analysis, question generation, and detailed answering.',
    category: AssistantCategory.Academic, // Or another relevant category
    published: 'Feb 04, 2025',
    stars: 100,
  },
  {
    name: 'Academic Revision Specialist',
    author: 'sunrisewestern',
    description: 'Skilled in academic writing and paper revision.',
    category: AssistantCategory.Academic,
    published: 'Jan 24, 2025',
    stars: 75,
  },
  {
    name: 'Socioeconomic Analyst',
    author: 'towerwp',
    description: 'Expert in social and economic issue analysis and information integration.',
    category: AssistantCategory.Academic, // Or another relevant category
    published: 'Jan 13, 2025',
    stars: 249,
  },
  {
    name: 'Wireless Communication Expert',
    author: 'yusphone',
    description: 'Expert in wireless communication technology, proficient in industry knowledge from 4G to 6G.',
    category: AssistantCategory.Academic, // Or another relevant category
    published: 'Oct 14, 2024',
    stars: 285,
  },
  {
    name: 'Ophthalmologist',
    author: 'yuxphone',
    description: 'Specialized in eye diagnosis and treatment recommendations.',
    category: AssistantCategory.Academic, // Or Medical/Health if you add it
    published: 'Oct 14, 2024',
    stars: 340,
  },
  {
    name: 'LaTeX Academic Paper Summa...',
    author: 'LaiXue',
    description: 'Specializes in analyzing academic papers and summarizing complex information into concise LaTeX format.',
    category: AssistantCategory.Academic,
    published: 'Sep 25, 2024',
    stars: 87,
  },
  {
    name: 'I Ching Divination Master',
    author: 'torwertop',
    description: 'I am Master Xuan YU, dedicated to interpreting the ancient wisdom of I Ching for modern guidance. Based on your queries, I can offer insights into the present circumstances and potential future developments through detailed hexagram analysis.',
    category: AssistantCategory.General,
    published: 'Sep 24, 2024',
    stars: 171,
  },
  {
    name: 'Book Summary Expert',
    author: 'sugarcane',
    description: 'Book summary expert, providing concise and easy-to-understand summaries of books for various genres.',
    category: AssistantCategory.General,
    published: 'Sep 21, 2024',
    stars: 110,
  },
  // Add more mock data for other categories for realistic counts and search
  { name: 'Career Navigator', author: 'jobwiz', description: 'Assists with career planning and job searching.', category: AssistantCategory.Career, published: 'Aug 01, 2024', stars: 180 },
  { name: 'Blog Post Writer', author: 'wordcraft', description: 'Generates engaging blog posts on various topics.', category: AssistantCategory.CopyWriting, published: 'Jul 10, 2024', stars: 220 },
  { name: 'UI/UX Feedback Bot', author: 'designaid', description: 'Provides constructive feedback on user interface designs.', category: AssistantCategory.Design, published: 'Jun 25, 2024', stars: 95 },
  { name: 'Exam Prep Assistant', author: 'gradesaver', description: 'Helps students prepare for exams with practice questions and summaries.', category: AssistantCategory.Education, published: 'May 15, 2024', stars: 140 },
  { name: 'Emotional Support AI', author: 'calmbot', description: 'Offers a listening ear and gentle guidance for emotional well-being.', category: AssistantCategory.Emotions, published: 'Apr 05, 2024', stars: 160 },
  { name: 'Movie Recommendation Engine', author: 'filmfan', description: 'Suggests movies based on your preferences and viewing history.', category: AssistantCategory.Entertainment, published: 'Mar 20, 2024', stars: 115 },
  { name: 'Dungeon Master AI', author: 'rpgbot', description: 'Helps create quests and scenarios for tabletop RPGs.', category: AssistantCategory.Games, published: 'Feb 10, 2024', stars: 80 },
  { name: 'Daily Affirmation Bot', author: 'mindsetpro', description: 'Delivers daily positive affirmations to boost your morale.', category: AssistantCategory.Life, published: 'Jan 01, 2024', stars: 190 },
  { name: 'Social Media Strategist', author: 'reachout', description: 'Develops strategies for effective social media presence.', category: AssistantCategory.Marketing, published: 'Dec 12, 2023', stars: 270 },
  { name: 'Meeting Minutes Taker', author: 'scribeai', description: 'Automatically transcribes and summarizes meeting discussions.', category: AssistantCategory.Office, published: 'Nov 01, 2023', stars: 130 },
  { name: 'JavaScript Debugger', author: 'codefixer', description: 'Identifies and suggests fixes for bugs in JavaScript code.', category: AssistantCategory.Programming, published: 'Oct 15, 2023', stars: 350 },
  { name: 'Multilingual Document Translator', author: 'globallingo', description: 'Translates entire documents while preserving formatting.', category: AssistantCategory.Translation, published: 'Sep 05, 2023', stars: 200 },
];


export default function DiscoverPage() {
  const categories = useCategory(); // Keep your useCategory hook
  const [activeCategory, setActiveCategory] = useState<AssistantCategory>(AssistantCategory.All);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter assistants based on active category and search query
  const filteredAssistants = assistantsData.filter(assistant => {
    const matchesCategory = activeCategory === AssistantCategory.All || assistant.category === activeCategory;
    const matchesSearch = assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assistant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assistant.author.toLowerCase().includes(searchQuery.toLowerCase()); // Search by author too
    return matchesCategory && matchesSearch;
  });

  // Calculate counts for categories based on the full data set for sidebar
  const getCategoryCount = (key: AssistantCategory) => {
    if (key === AssistantCategory.All) return assistantsData.length;
    return assistantsData.filter(a => a.category === key).length;
  };

  return (
    // Main container flex layout. pt-16 expects a fixed header above this component.
    <div className="flex h-full pt-16">
      {/* 2nd Sidebar - Category list */}
      <aside className="w-60 border-r border-gray-200 bg-muted/40 px-4 py-6 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Domains</h2>
        <nav className="space-y-2">
          {/* Ensure categories from useCategory also include an 'icon' property.
              If not, you might need to map them or pass mock icons as I did previously. */}
          {categories.map((cat) => (
            <Button
              key={cat.key}
              variant={activeCategory === cat.key ? 'default' : 'ghost'}
              className={cn(
    'w-full justify-start gap-2 transition-colors',
    activeCategory === cat.key
      ? 'bg-[#eb5931] text-white hover:bg-[#f9755a]'
      : 'text-black hover:bg-[#F9866F] hover:text-white'
  )}
              onClick={() => setActiveCategory(cat.key)}
            >
              {/* Assuming cat.icon is a component or an element like <Home className="w-4 h-4" /> */}
              <cat.icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span className="ml-auto text-sm text-gray-500">{getCategoryCount(cat.key)}</span>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6 border-l border-gray-200 md:border-l-0"> {/* Added border to left, but only on larger screens for responsiveness */}
        {/* Inner header (under main header) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
          <h1 className="text-2xl font-bold text-gray-800">Discover Agents</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-auto"> {/* Adjusted for wrap on smaller screens */}
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0 max-w-xs">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search by name, description, or keywords..."
                    className="pl-8 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button 
            variant="outline" 
            className="border-gray-300 text-black hover:bg-[#eb5931]">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Agent
              </Button>
            {/* <Button variant="outline" className="border-gray-300 text-black hover:bg-[#eb5931]">Model</Button>
            <Button variant="outline" className="border-gray-300 text-black hover:bg-[#eb5931]">Provider</Button>
            <Button variant="outline" className="border-gray-300 text-black hover:bg-[#eb5931]">Recently Published</Button> Added this button */}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssistants.length > 0 ? (
            filteredAssistants.map((assistant, i) => (
              <Card key={i} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {assistant.name}
                  </CardTitle>
                  {/* GitHub icon placeholder */}
                  <Github className="w-5 h-5 text-gray-500" />
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p className="mb-2 line-clamp-2">{assistant.description}</p> {/* line-clamp for neat descriptions */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>by {assistant.author}</span>
                    <span>⭐️ {assistant.stars}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Published on {assistant.published}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              No agents found for the selected category or search query.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation for Mobile (from image 3) */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-16 items-center justify-around border-t border-gray-200 bg-white shadow-md sm:hidden">
        <Button variant="ghost" className="flex flex-col text-xs text-gray-600 hover:text-gray-900">
          <span>💬</span>Chat
        </Button>
        <Button variant="ghost" className="flex flex-col text-xs text-gray-600 hover:text-gray-900">
          <span>✨</span>Discover
        </Button>
        <Button variant="ghost" className="flex flex-col text-xs text-gray-600 hover:text-gray-900">
          <span>👤</span>Me
        </Button>
      </footer>
    </div>
  )
}