import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Feed from './routes/Feed.jsx'
import Favorites from './routes/Favorites.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
