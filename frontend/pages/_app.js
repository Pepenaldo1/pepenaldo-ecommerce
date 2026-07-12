import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            <Component {...pageProps} />
          </main>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
