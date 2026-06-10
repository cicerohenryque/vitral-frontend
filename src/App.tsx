import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthPage } from './components/Auth/AuthPage'
import { CategoriesPage } from './components/Categories/CategoriesPage'
import { FavoritesPage } from './components/Favorites/FavoritesPage'
import { HelpPage } from './components/Help/HelpPage'
import { HomePage } from './components/Home/HomePage'
import { MessagesPage } from './components/Messages/MessagesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/mensagens" element={<MessagesPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/entrar" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
