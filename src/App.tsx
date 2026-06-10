import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthPage } from './components/Auth/AuthPage'
import { AccountPage } from './components/Account/AccountPage'
import { CartPage } from './components/Cart/CartPage'
import { CategoriesPage } from './components/Categories/CategoriesPage'
import { FavoritesPage } from './components/Favorites/FavoritesPage'
import { HelpPage } from './components/Help/HelpPage'
import { HistoryPage } from './components/History/HistoryPage'
import { HomePage } from './components/Home/HomePage'
import { ListingsPage } from './components/Listings/ListingsPage'
import { MessagesPage } from './components/Messages/MessagesPage'
import { OffersPage } from './components/Offers/OffersPage'
import { ProductPage } from './components/Product/ProductPage'
import { ReservationsPage } from './components/Reservations/ReservationsPage'
import { ReleasesPage } from './components/Releases/ReleasesPage'
import { SearchResultsPage } from './components/Search/SearchResultsPage'
import { SellerPage } from './components/Seller/SellerPage'
import { SupportPage } from './components/Support/SupportPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/conta" element={<AccountPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/anuncios" element={<ListingsPage />} />
        <Route path="/mensagens" element={<MessagesPage />} />
        <Route path="/ofertas" element={<OffersPage />} />
        <Route path="/produto/:productId" element={<ProductPage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="/vendedor/:sellerId" element={<SellerPage />} />
        <Route path="/lancamentos" element={<ReleasesPage />} />
        <Route path="/buscar" element={<SearchResultsPage />} />
        <Route path="/suporte" element={<SupportPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/entrar" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
