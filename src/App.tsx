import { lazy, Suspense } from 'react'
import type { ComponentType } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AccountType } from './types/account'
import { GlobalNavigation } from './components/GlobalNavigation'

const lazyPage = <T extends Record<K, ComponentType>, K extends keyof T>(
  loader: () => Promise<T>, exportName: K,
) => lazy(() => loader().then((module) => ({ default: module[exportName] })))

const CartPage = lazyPage(() => import('./components/Cart/CartPage'), 'CartPage')
const ClassicsPage = lazyPage(() => import('./components/Classics/ClassicsPage'), 'ClassicsPage')
const CategoriesPage = lazyPage(() => import('./components/Categories/CategoriesPage'), 'CategoriesPage')
const CheckoutPage = lazyPage(() => import('./components/Checkout/CheckoutPage'), 'CheckoutPage')
const DeleteAccountPage = lazyPage(() => import('./components/DeleteAccount/DeleteAccountPage'), 'DeleteAccountPage')
const FavoritesPage = lazyPage(() => import('./components/Favorites/FavoritesPage'), 'FavoritesPage')
const HelpPage = lazyPage(() => import('./components/Help/HelpPage'), 'HelpPage')
const HistoryPage = lazyPage(() => import('./components/History/HistoryPage'), 'HistoryPage')
const MessagesPage = lazyPage(() => import('./components/Messages/MessagesPage'), 'MessagesPage')
const OffersPage = lazyPage(() => import('./components/Offers/OffersPage'), 'OffersPage')
const ProductPage = lazyPage(() => import('./components/Product/ProductPage'), 'ProductPage')
const ReleasesPage = lazyPage(() => import('./components/Releases/ReleasesPage'), 'ReleasesPage')
const ReservationsPage = lazyPage(() => import('./components/Reservations/ReservationsPage'), 'ReservationsPage')
const SaleConfirmationPage = lazyPage(() => import('./components/Sales/SaleConfirmationPage'), 'SaleConfirmationPage')
const SalesHistoryPage = lazyPage(() => import('./components/Sales/SalesHistoryPage'), 'SalesHistoryPage')
const SalesOrdersPage = lazyPage(() => import('./components/Sales/SalesOrdersPage'), 'SalesOrdersPage')
const SellerPage = lazyPage(() => import('./components/Seller/SellerPage'), 'SellerPage')
const SupportPage = lazyPage(() => import('./components/Support/SupportPage'), 'SupportPage')
const AuthPage = lazyPage(() => import('./pages/AuthPage'), 'AuthPage')
const BuscaPage = lazyPage(() => import('./pages/BuscaPage'), 'BuscaPage')
const ConfirmarEmailPage = lazyPage(() => import('./pages/ConfirmarEmailPage'), 'ConfirmarEmailPage')
const HomePage = lazyPage(() => import('./pages/HomePage'), 'HomePage')
const ForgotPasswordPage = lazyPage(() => import('./pages/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyPage(() => import('./pages/ResetPasswordPage'), 'ResetPasswordPage')
const ResendConfirmationPage = lazyPage(() => import('./pages/ResendConfirmationPage'), 'ResendConfirmationPage')
const MeuSeboPage = lazyPage(() => import('./pages/MeuSeboPage'), 'MeuSeboPage')
const MeusProdutosPage = lazyPage(() => import('./pages/MeusProdutosPage'), 'MeusProdutosPage')
const MinhasOfertasPage = lazyPage(() => import('./pages/MinhasOfertasPage'), 'MinhasOfertasPage')
const NotFoundPage = lazyPage(() => import('./pages/NotFoundPage'), 'NotFoundPage')
const PerfilPage = lazyPage(() => import('./pages/PerfilPage'), 'PerfilPage')
const RecomendacoesPage = lazyPage(() => import('./pages/RecomendacoesPage'), 'RecomendacoesPage')
const SeboDocumentsPage = lazyPage(() => import('./pages/SeboDocumentsPage'), 'SeboDocumentsPage')
const AdminSeboVerificationPage = lazyPage(() => import('./pages/AdminSeboVerificationPage'), 'AdminSeboVerificationPage')
const AdminPage = lazyPage(() => import('./pages/AdminPage'), 'AdminPage')

function App() {
  return (
    <BrowserRouter>
      <GlobalNavigation />
      <Suspense fallback={<main aria-busy="true" aria-live="polite">Carregando página...</main>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/entrar" element={<AuthPage />} />
        <Route path="/auth/confirmar" element={<ConfirmarEmailPage />} />
        <Route path="/auth/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="/auth/redefinir-senha" element={<ResetPasswordPage />} />
        <Route path="/auth/reenviar-confirmacao" element={<ResendConfirmationPage />} />
        <Route path="/busca" element={<BuscaPage />} />
        <Route path="/buscar" element={<BuscaPage />} />

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
        <Route
          path="/painel/ofertas"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <MinhasOfertasPage />
            </ProtectedRoute>
          }
        />
        <Route path="/painel/sebo/documentos" element={<ProtectedRoute requireRole={AccountType.SEBO}><SeboDocumentsPage /></ProtectedRoute>} />
        <Route path="/admin/sebos" element={<ProtectedRoute requireRole={AccountType.ADMIN}><AdminSeboVerificationPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireRole={AccountType.ADMIN}><AdminPage /></ProtectedRoute>} />

        <Route
          path="/conta"
          element={
            <ProtectedRoute>
              <PerfilPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conta/excluir"
          element={
            <ProtectedRoute>
              <DeleteAccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carrinho"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmar-pedido"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route
          path="/favoritos"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recomendacoes"
          element={
            <ProtectedRoute requireRole={AccountType.USUARIO}>
              <RecomendacoesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historico"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/anuncios"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <MeusProdutosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mensagens"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/ofertas" element={<OffersPage />} />
        <Route path="/produto/:productId" element={<ProductPage />} />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sebo/perfil"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <MeuSeboPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendas"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <SalesOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendas/historico"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <SalesHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendas/:orderId/confirmar"
          element={
            <ProtectedRoute requireRole={AccountType.SEBO}>
              <SaleConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route path="/vendedor/:sellerId" element={<SellerPage />} />
        <Route path="/lancamentos" element={<ReleasesPage />} />
        <Route path="/classicos" element={<ClassicsPage />} />
        <Route
          path="/suporte"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
