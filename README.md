# 🎯 Prompt Gallery

A social hub to write, share, like, and collaborate on AI prompts. Think of it as a blog-like platform specifically designed for the AI community to discover, collect, and share high-quality prompts.

# ✨ Evidencia de Automejora

## 🚀 Sistema de Refinamiento Inteligente de Prompts

Nuestro sistema incluye una funcionalidad avanzada de **automejora de prompts** que utiliza inteligencia artificial para analizar, evaluar y generar variantes optimizadas de cualquier prompt ingresado por el usuario.

### 🎯 ¿Por qué es importante?

La calidad de un prompt determina directamente la calidad de la respuesta de la IA. Un prompt mal estructurado, ambiguo o incompleto puede resultar en respuestas imprecisas o inútiles. Nuestro sistema de automejora:

- **📊 Analiza** la claridad y completitud del prompt original
- **🔍 Identifica** problemas específicos y áreas de mejora
- **🎨 Genera** múltiples variantes optimizadas (concisa, detallada, testeable)
- **⚡ Evalúa** cada variante con métricas cuantitativas
- **🏆 Recomienda** la mejor versión basada en análisis objetivo

### 🛠️ Endpoint de Refinamiento

**URL**: `http://3.134.5.42/api/refine`  
**Método**: `POST`  
**Content-Type**: `application/json`

#### Request Body:
```json
{
  "prompt": "Create a Python function to sort a list of numbers",
  "task_type": "code"
}
```

#### Response Structure:
```json
{
  "promptId": "NO_DATABASE",
  "analysis": {
    "issues": [
      "El prompt es bastante claro, pero podría ser más específico sobre el tipo de ordenación",
      "No se menciona si se deben manejar casos especiales como listas vacías"
    ],
    "suggestions": [
      "Especificar si la función debe ordenar en orden ascendente o descendente",
      "Incluir instrucciones sobre cómo manejar listas vacías",
      "Proporcionar ejemplos de entrada y salida esperados"
    ],
    "clarity_score": 0.7,
    "completeness_score": 0.6,
    "raw_analysis": "Análisis detallado del prompt..."
  },
  "variants": {
    "concise": "Versión simplificada del prompt",
    "detailed": "Versión expandida con más contexto y especificaciones",
    "testable": "Versión optimizada para evaluación clara con criterios específicos"
  },
  "evaluations": [
    {
      "type": "testable",
      "score": 0.74,
      "metrics": {
        "clarity": 0.55,
        "completeness": 0.85,
        "specificity": 0.80,
        "token_count": 100,
        "estimated_cost": 0.000015
      }
    }
  ],
  "best": {
    "type": "testable",
    "score": 0.74,
    "content": "La versión recomendada del prompt mejorado"
  },
  "metadata": {
    "processing_time_ms": 49767,
    "model_used": "gpt-4o-mini",
    "total_tokens": 196
  }
}
```

#### Tipos de Tareas Soportadas:
- `"code"` - Para prompts relacionados con programación y desarrollo
- `"creative"` - Para prompts de escritura creativa y contenido artístico  
- `"general"` - Para prompts de propósito general y análisis

### 🎪 Integración en la UI

El sistema se integra seamlessly en nuestra interfaz de creación de prompts:

1. **Detección Automática**: El sistema determina el `task_type` basándose en las categorías seleccionadas
2. **Análisis Visual**: Muestra scores de claridad y completitud en tiempo real
3. **Selección Interactiva**: El usuario puede elegir entre múltiples variantes mejoradas
4. **Retroalimentación Inmediata**: Identifica problemas específicos y ofrece sugerencias concretas

### 🔬 Valor Agregado

Esta funcionalidad convierte nuestra plataforma en más que un simple repositorio de prompts - la transforma en una **herramienta activa de mejora de la calidad del contenido**, donde cada prompt puede ser optimizado profesionalmente antes de ser compartido con la comunidad.

---

## ✨ Features

- **🔍 Discover Prompts**: Browse a curated collection of AI prompts with search and filtering
- **❤️ Like & Collect**: Like your favorite prompts and build your personal collection
- **📋 One-Click Copy**: Instantly copy prompts to your clipboard
- **🏷️ Smart Categorization**: Filter prompts by category, language, and AI model compatibility
- **🔐 Secure Authentication**: Sign in with magic links via Supabase Auth
- **📱 Responsive Design**: Beautiful dark theme that works on all devices
- **⚡ Optimistic UI**: Instant feedback for likes and interactions

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Routing**: React Router
- **State Management**: React Context API
- **Authentication**: Supabase Auth (Magic Link/OTP)
- **Database**: Supabase (PostgreSQL)
- **Language**: JavaScript (beginner-friendly, no TypeScript)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/danyparc/prompt-gallery-front.git
   cd prompt-gallery-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🗄️ Database Schema

The application expects the following Supabase tables:

### `prompts`
```sql
id: uuid (primary key)
title: text
body: text
categories: text[]
models: text[]
language: text
author_id: uuid (foreign key to auth.users)
created_at: timestamp
updated_at: timestamp
```

### `likes`
```sql
id: uuid (primary key)
user_id: uuid (foreign key to auth.users)
prompt_id: uuid (foreign key to prompts)
created_at: timestamp
```

### `profiles`
```sql
id: uuid (primary key, foreign key to auth.users)
full_name: text
email: text
created_at: timestamp
updated_at: timestamp
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation and search
│   ├── PromptCard.jsx  # Individual prompt display
│   ├── LikeButton.jsx  # Like/unlike functionality
│   ├── AuthDialog.jsx  # Login modal
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.jsx # Authentication state
│   └── FeedContext.jsx # Feed filters and likes
├── lib/                # Utilities and API
│   ├── supabase.js     # Supabase client config
│   ├── api.js          # API functions
│   └── mockData.js     # Development mock data
├── routes/             # Page components
│   ├── Feed.jsx        # Main feed page
│   └── Favorites.jsx   # User favorites page
└── styles/
    └── index.css       # Global styles and Tailwind imports
```

## 🎨 Design System

- **Color Scheme**: Dark theme with gray-900 background
- **Typography**: System fonts with clear hierarchy
- **Components**: Card-based layout with subtle shadows and hover effects
- **Responsive**: Mobile-first design with breakpoints for tablet and desktop

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Mock Data Mode

For development, the app includes mock data. To switch between mock and real data:

In `src/lib/api.js`, toggle:
```javascript
const USE_MOCK_DATA = true // false for production
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Prompt creation and editing
- [ ] User profiles and author pages
- [ ] Prompt collections/playlists
- [ ] Advanced search with AI-powered recommendations
- [ ] Social features (comments, shares)
- [ ] API for third-party integrations
- [ ] Mobile app

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/danyparc/prompt-gallery-front/issues) page
2. Create a new issue with detailed description
3. Join our community discussions

---

Built with ❤️ for the AI community
