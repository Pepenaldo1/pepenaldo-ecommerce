import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display font-bold text-3xl mb-8">Create account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
        />
        {error && <p className="text-magenta text-sm font-mono">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan text-bg font-display font-semibold uppercase tracking-wide py-3 rounded-md hover:shadow-[0_0_24px_#A855F755] transition disabled:opacity-40"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-gray-500 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-cyan underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
