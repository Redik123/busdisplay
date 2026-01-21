'use client';

import Link from 'next/link';

/**
 * Page affichée quand l'utilisateur est offline et n'a pas de cache
 */
export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
                {/* Icône */}
                <div className="text-8xl mb-6">📡</div>

                {/* Titre */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    Hors connexion
                </h1>

                {/* Message */}
                <p className="text-gray-400 text-lg mb-8">
                    Vous n&apos;êtes pas connecté à Internet.
                    Vérifiez votre connexion et réessayez.
                </p>

                {/* Boutons */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg 
                      font-medium text-white transition-colors"
                    >
                        🔄 Réessayer
                    </button>

                    <Link
                        href="/display"
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg 
                      font-medium text-white transition-colors text-center"
                    >
                        🏠 Retour à l&apos;accueil
                    </Link>
                </div>

                {/* Info cache */}
                <p className="text-gray-500 text-sm mt-8">
                    Si vous avez déjà visité cette page, les données en cache
                    seront utilisées automatiquement.
                </p>
            </div>
        </div>
    );
}
