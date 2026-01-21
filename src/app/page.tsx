import Link from 'next/link';

/**
 * Page d'accueil - Redirige vers l'affichage ou affiche un écran d'accueil
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
                    flex flex-col items-center justify-center p-8">

      {/* Logo et titre */}
      <div className="text-center mb-12">
        <div className="text-8xl mb-6">🚌</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Bus Display
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          Affichage des horaires de bus en temps réel pour les arrêts suisses
        </p>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/display"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold
                    text-white text-lg transition-all duration-200 hover:scale-105
                    shadow-lg shadow-blue-600/25 flex items-center gap-3"
        >
          <span>📺</span>
          Voir l&apos;affichage
        </Link>

        <Link
          href="/admin"
          className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold
                    text-white text-lg transition-all duration-200 hover:scale-105
                    border border-gray-600 flex items-center gap-3"
        >
          <span>⚙️</span>
          Configurer
        </Link>
      </div>

      {/* Infos */}
      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>Données fournies par transport.opendata.ch</p>
        <p className="mt-2">Développé avec Next.js 16 • TypeScript • Tailwind CSS</p>
      </div>
    </div>
  );
}
