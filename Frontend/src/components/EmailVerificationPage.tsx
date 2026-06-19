import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { authAPI } from '../lib/api';

interface EmailVerificationPageProps {
  token: string | null;
  onDone: () => void;
}

export default function EmailVerificationPage({ token, onDone }: EmailVerificationPageProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        if (response?.message) {
          setMessage(response.message);
        }
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.message || 'Verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-atlas flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white/90 backdrop-blur border border-white/70 shadow-2xl p-10 text-center">
        <div className="flex justify-center">
          {status === 'verifying' && <Loader2 className="h-12 w-12 text-emerald-700 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="h-12 w-12 text-emerald-700" />}
          {status === 'error' && <AlertTriangle className="h-12 w-12 text-rose-600" />}
        </div>

        <h1 className="mt-6 text-3xl font-display text-ink">Email Verification</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>

        <button
          onClick={onDone}
          className="mt-8 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:bg-black transition"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
