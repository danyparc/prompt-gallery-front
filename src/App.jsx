import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Feed from './routes/Feed.jsx'
import Favorites from './routes/Favorites.jsx'
import Create from './routes/Create.jsx'

function App() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
