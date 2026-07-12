import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function BecomeVendor() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  if (user?.role === 'vendor' || user?.role === 'admin') {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display font-bold text-2xl mb-4">You're already a seller</h1>
        <button
          onClick={() => router.push('/vendor/dashboard')}
          className="bg-cyan text-bg font-display font-semibold uppercase tracking-wide px-6 py-2.5 rounded-md"
        >
          Go to seller dashboard
        </button>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Registering as a vendor re-issues the JWT with role=vendor.
      // We store it manually here so the change takes effect right away.
      const data = await api.post('/vendor/register', { business_name: businessName, vendor_bio: bio }, token);
      localStorage.setItem('pepenaldo_token', data.token);
      localStorage.setItem('pepenaldo_user', JSON.stringify(data.user));
      router.push('/vendor/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">Become a seller</h1>
      <p className="text-gray-500 mb-8">
        Open your own storefront on Pepenaldo and start listing products to customers.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-surface border border-line rounded-xl p-6">
        <input
          required
          placeholder="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        />
        <textarea
          placeholder="Tell buyers about your business (optional)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        />
        {error && <p className="text-magenta text-sm font-mono">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-cyan text-bg font-display font-semibold uppercase tracking-wide px-6 py-2.5 rounded-md disabled:opacity-50"
        >
          {submitting ? 'Setting up…' : 'Start selling'}
        </button>
      </form>
    </div>
  );
}
