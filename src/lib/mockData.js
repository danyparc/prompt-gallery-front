// Helper function to create properly structured prompt data
function createMockPrompt(id, title, content, categories, authorName, authorId, language, models, likesCount, currentUserLiked, createdAt, tags = [], type = 'general') {
  const categorySlug = (str) => str.toLowerCase().replace(/\s+/g, '-');
  
  return {
    // Database schema fields
    id,
    author_id: authorId,
    title,
    content,
    type,
    language,
    category_slugs: categories.map(categorySlug),
    tags,
    models,
    likes_count: likesCount,
    favorites_count: Math.floor(likesCount * 0.2), // Simulate 20% favorite ratio
    forks_count: Math.floor(likesCount * 0.05), // Simulate 5% fork ratio
    is_public: true,
    created_at: createdAt,
    updated_at: createdAt,
    
    // Legacy fields for backward compatibility
    body: content,
    categories,
    authorName,
    likesCount,
    currentUserLiked,
    createdAt,
    updatedAt: createdAt
  };
}

// Mock data for development and testing
export const mockPrompts = [
  createMockPrompt(
    '1',
    'Creative Story Generator',
    'Write a compelling short story about a character who discovers they can see 24 hours into the future, but only when they are completely still and silent. The story should explore the psychological and practical implications of this ability.',
    ['Creative Writing', 'Fiction'],
    'Sarah Writer',
    'user-1',
    'English',
    ['GPT-4', 'Claude'],
    42,
    false,
    '2024-01-15T10:30:00Z',
    ['storytelling', 'sci-fi', 'psychology'],
    'creative'
  ),
  createMockPrompt(
    '2',
    'React Component Generator',
    'Generate a React functional component that implements a responsive card layout with hover effects, loading states, and TypeScript types. Include proper accessibility attributes and follow modern React patterns.',
    ['Code Generation', 'React'],
    'DevMaster',
    'user-2',
    'English',
    ['GPT-4', 'Codex'],
    128,
    true,
    '2024-01-14T15:45:00Z',
    ['react', 'typescript', 'components'],
    'code'
  ),
  createMockPrompt(
    '3',
    'Market Analysis Assistant',
    'Analyze the given market data and provide insights on trends, opportunities, and potential risks. Include specific recommendations for strategic decisions and supporting data visualization suggestions.',
    ['Business', 'Analysis'],
    'BusinessPro',
    'user-3',
    'English',
    ['GPT-4', 'Claude'],
    67,
    false,
    '2024-01-13T09:20:00Z',
    ['analysis', 'business', 'market'],
    'business'
  ),
  createMockPrompt(
    '4',
    'Spanish Language Tutor',
    'Actúa como un tutor de español experimentado. Crea ejercicios interactivos que ayuden a practicar la conjugación de verbos en tiempo presente, incluye ejemplos prácticos y correcciones constructivas.',
    ['Education', 'Language'],
    'ProfesorEspañol',
    'user-4',
    'Spanish',
    ['GPT-4'],
    89,
    true,
    '2024-01-12T14:10:00Z',
    ['spanish', 'education', 'grammar'],
    'educational'
  ),
  createMockPrompt(
    '5',
    'Research Paper Summarizer',
    'Summarize the key findings, methodology, and implications of the provided research paper. Focus on the most significant contributions and present them in an accessible format for general audiences.',
    ['Research', 'Analysis'],
    'AcademicHelper',
    'user-5',
    'English',
    ['Claude', 'GPT-4'],
    156,
    false,
    '2024-01-11T11:30:00Z',
    ['research', 'summary', 'academic'],
    'research'
  ),
  createMockPrompt(
    '6',
    'Funny Meme Generator',
    'Create hilarious and relatable memes about everyday situations. Focus on programming humor, work-from-home life, or popular culture references. Keep it clean and universally funny.',
    ['Fun', 'Creative Writing'],
    'MemeKing',
    'user-6',
    'English',
    ['GPT-4'],
    234,
    true,
    '2024-01-10T16:20:00Z',
    ['humor', 'memes', 'programming'],
    'fun'
  )
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

export async function mockCreatePrompt(promptData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const newId = (mockPrompts.length + 1).toString()
  const now = new Date().toISOString()
  
  const newPrompt = createMockPrompt(
    newId,
    promptData.title,
    promptData.content,
    promptData.categories || ['General'],
    'Current User', // In real app, get from auth context
    'current-user-id',
    promptData.language || 'English',
    promptData.models || ['GPT-4'],
    0, // New prompts start with 0 likes
    false,
    now,
    promptData.tags || [],
    promptData.type || 'general'
  )
  
  // Add to mock data
  mockPrompts.unshift(newPrompt) // Add to beginning
  
  return newPrompt
}

export async function mockImprovePrompt(originalContent) {
  // Simulate API delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock AI improvement - in real app, this would call an AI service
  const improvements = [
    "Be more specific about the context and expected output format",
    "Add example inputs and desired outputs",
    "Include constraints or limitations to guide the response",
    "Specify the target audience or use case",
    "Add clarity about the tone and style of response needed"
  ]
  
  const randomImprovement = improvements[Math.floor(Math.random() * improvements.length)]
  
  return {
    improvedContent: `${originalContent}\n\n${randomImprovement}`,
    suggestions: [
      randomImprovement,
      "Consider adding more context",
      "Specify the expected output format"
    ]
  }
}