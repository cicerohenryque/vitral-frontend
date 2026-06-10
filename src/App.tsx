import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { BuscaPage } from './pages/BuscaPage'
import { ConfirmarEmailPage } from './pages/ConfirmarEmailPage'
import { HomePage } from './pages/HomePage'
import { MeuSeboPage } from './pages/MeuSeboPage'
import { MeusProdutosPage } from './pages/MeusProdutosPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PerfilPage } from './pages/PerfilPage'
import { CategoriesPage } from './components/Categories/CategoriesPage'
import { FavoritesPage } from './components/Favorites/FavoritesPage'
import { HelpPage } from './components/Help/HelpPage'
import { MessagesPage } from './components/Messages/MessagesPage'
import { OffersPage } from './components/Offers/OffersPage'
import { ReleasesPage } from './components/Releases/ReleasesPage'
import { SupportPage } from './components/Support/SupportPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AccountType } from './types/account'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/confirmar" element={<ConfirmarEmailPage />} />
        <Route path="/busca" element={<BuscaPage />} />
        <Route
          path="/painel/perfil"
          element={
            <ProtectedRoute>
              <PerfilPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/painel/sebo"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <MeuSeboPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/painel/produtos"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <MeusProdutosPage />
            </ProtectedRoute>
          }
        />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/mensagens" element={<MessagesPage />} />
        <Route path="/ofertas" element={<OffersPage />} />
        <Route path="/lancamentos" element={<ReleasesPage />} />
        <Route path="/suporte" element={<SupportPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
