import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display font-bold text-3xl mb-8">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
        />
        {error && <p className="text-magenta text-sm font-mono">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan text-bg font-display font-semibold uppercase tracking-wide py-3 rounded-md hover:shadow-[0_0_24px_#A855F755] transition disabled:opacity-40"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="text-gray-500 text-sm mt-6">
        No account?{' '}
        <Link href="/register" className="text-cyan underline">
          Register
        </Link>
      </p>
    </div>
  );
}
