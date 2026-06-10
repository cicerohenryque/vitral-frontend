import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthPage } from './components/Auth/AuthPage'
import { AccountPage } from './components/Account/AccountPage'
import { CartPage } from './components/Cart/CartPage'
import { CategoriesPage } from './components/Categories/CategoriesPage'
import { FavoritesPage } from './components/Favorites/FavoritesPage'
import { HelpPage } from './components/Help/HelpPage'
import { HomePage } from './components/Home/HomePage'
import { MessagesPage } from './components/Messages/MessagesPage'
import { OffersPage } from './components/Offers/OffersPage'
import { ProductPage } from './components/Product/ProductPage'
import { ReleasesPage } from './components/Releases/ReleasesPage'
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
        <Route path="/mensagens" element={<MessagesPage />} />
        <Route path="/ofertas" element={<OffersPage />} />
        <Route path="/produto/:productId" element={<ProductPage />} />
        <Route path="/vendedor/:sellerId" element={<SellerPage />} />
        <Route path="/lancamentos" element={<ReleasesPage />} />
        <Route path="/suporte" element={<SupportPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/entrar" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
