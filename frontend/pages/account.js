import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-8">My account</h1>

      <div className="bg-surface border border-line rounded-xl p-6 mb-8">
        <div className="flex flex-col gap-4 font-mono text-sm">
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-gray-500">Name</span>
            <span>{user.name}</span>
          </div>
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-gray-500">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-gray-500">Phone</span>
            <span>{user.phone || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="uppercase text-cyan">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/orders"
          className="bg-surface border border-line rounded-lg px-5 py-4 hover:border-cyan transition"
        >
          View my orders →
        </Link>
        {user.role === 'admin' && (
          <Link
            href="/admin"
            className="bg-surface border border-line rounded-lg px-5 py-4 hover:border-cyan transition"
          >
            Go to admin dashboard →
          </Link>
        )}
        <button
          onClick={logout}
          className="text-left border border-line rounded-lg px-5 py-4 text-magenta hover:border-magenta transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
