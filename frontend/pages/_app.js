import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { WishlistProvider } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main className="min-h-screen pb-16 md:pb-0">
              <Component {...pageProps} />
            </main>
            <BottomNav />
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
