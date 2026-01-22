import { redirect } from 'next/navigation';

/**
 * Page d'accueil - Redirige automatiquement vers /display
 */
export default function HomePage() {
  redirect('/display');
}
