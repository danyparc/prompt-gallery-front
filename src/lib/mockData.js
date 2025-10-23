// Mock data for development and testing
export const mockPrompts = [
  {
    id: '1',
    title: 'Creative Story Generator',
    body: 'Write a compelling short story about a character who discovers they can see 24 hours into the future, but only when they are completely still and silent. The story should explore the psychological and practical implications of this ability.',
    categories: ['Creative Writing', 'Fiction'],
    authorName: 'Sarah Writer',
    language: 'English',
    models: ['GPT-4', 'Claude'],
    likesCount: 42,
    currentUserLiked: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'React Component Generator',
    body: 'Generate a React functional component that implements a responsive card layout with hover effects, loading states, and TypeScript types. Include proper accessibility attributes and follow modern React patterns.',
    categories: ['Code Generation', 'React'],
    authorName: 'DevMaster',
    language: 'English',
    models: ['GPT-4', 'Codex'],
    likesCount: 128,
    currentUserLiked: true,
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    title: 'Market Analysis Assistant',
    body: 'Analyze the given market data and provide insights on trends, opportunities, and potential risks. Include specific recommendations for strategic decisions and supporting data visualization suggestions.',
    categories: ['Business', 'Analysis'],
    authorName: 'BusinessPro',
    language: 'English',
    models: ['GPT-4', 'Claude'],
    likesCount: 67,
    currentUserLiked: false,
    createdAt: '2024-01-13T09:20:00Z',
    updatedAt: '2024-01-13T09:20:00Z'
  },
  {
    id: '4',
    title: 'Spanish Language Tutor',
    body: 'Actúa como un tutor de español experimentado. Crea ejercicios interactivos que ayuden a practicar la conjugación de verbos en tiempo presente, incluye ejemplos prácticos y correcciones constructivas.',
    categories: ['Education', 'Language'],
    authorName: 'ProfesorEspañol',
    language: 'Spanish',
    models: ['GPT-4'],
    likesCount: 89,
    currentUserLiked: true,
    createdAt: '2024-01-12T14:10:00Z',
    updatedAt: '2024-01-12T14:10:00Z'
  },
  {
    id: '5',
    title: 'Research Paper Summarizer',
    body: 'Summarize the key findings, methodology, and implications of the provided research paper. Focus on the most significant contributions and present them in an accessible format for general audiences.',
    categories: ['Research', 'Analysis'],
    authorName: 'AcademicHelper',
    language: 'English',
    models: ['Claude', 'GPT-4'],
    likesCount: 156,
    currentUserLiked: false,
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z'
  },
  {
    id: '6',
    title: 'Funny Meme Generator',
    body: 'Create hilarious and relatable memes about everyday situations. Focus on programming humor, work-from-home life, or popular culture references. Keep it clean and universally funny.',
    categories: ['Fun', 'Creative Writing'],
    authorName: 'MemeKing',
    language: 'English',
    models: ['GPT-4'],
    likesCount: 234,
    currentUserLiked: true,
    createdAt: '2024-01-10T16:20:00Z',
    updatedAt: '2024-01-10T16:20:00Z'
  }
]

// Mock API functions that simulate Supabase calls
export async function mockListPrompts({ q, category, language, page = 1, pageSize = 10 }) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let filteredPrompts = [...mockPrompts]
  
  // Apply filters
  if (q) {
    const query = q.toLowerCase()
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(query) || 
      prompt.body.toLowerCase().includes(query)
    )
  }
  
  if (category) {
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.categories.includes(category)
    )
  }
  
  if (language) {
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.language === language
    )
  }
  
  // Apply pagination
  const total = filteredPrompts.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = filteredPrompts.slice(start, end)
  
  return { data, total }
}

export async function mockToggleLike(promptId) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const prompt = mockPrompts.find(p => p.id === promptId)
  if (!prompt) {
    throw new Error('Prompt not found')
  }
  
  // Toggle like status
  prompt.currentUserLiked = !prompt.currentUserLiked
  prompt.likesCount += prompt.currentUserLiked ? 1 : -1
  
  return {
    likesCount: prompt.likesCount,
    currentUserLiked: prompt.currentUserLiked
  }
}

export async function mockGetUserFavorites(page = 1, pageSize = 10) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const favorites = mockPrompts.filter(prompt => prompt.currentUserLiked)
  
  // Apply pagination
  const total = favorites.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = favorites.slice(start, end)
  
  return { data, total }
}