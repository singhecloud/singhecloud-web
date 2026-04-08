import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface SpeechToken {
  final_token: string | null;
  partial_token: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Gurbani Navigator', href: dashboard().url },
];

export default function GurbaniNavigator() {
  const [token, setToken] = useState<SpeechToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>; // Correct type

    const fetchToken = () => {
      axios
        .get('/speech/tokens')
        .then((res) => {
          setToken(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch current token:', err);
          setToken(null);
        })
        .finally(() => setLoading(false));
    };

    fetchToken();

    interval = setInterval(fetchToken, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gurbani Navigator" />

      <div className="p-4">
        {loading ? (
          <p>Loading current tokens...</p>
        ) : token ? (
          <div className="space-y-2">
            <p>
              <strong>Final Token:</strong> {token.final_token || '—'}
            </p>
            <p>
              <strong>Partial Token:</strong> {token.partial_token || '—'}
            </p>
          </div>
        ) : (
          <p>No current token found.</p>
        )}
      </div>
    </AppLayout>
  );
}