'use client';

import { useConfig } from '@/hooks/useConfig';

/**
 * Composant de configuration du mode veille
 */
export default function SleepModeConfig() {
    const { config, updateSleepMode, toggleSleepMode } = useConfig();
    const { sleepMode } = config;

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">
                    Mode veille
                </label>

                {/* Toggle switch */}
                <button
                    onClick={toggleSleepMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                     ${sleepMode.enabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                       ${sleepMode.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
                L&apos;écran s&apos;éteindra automatiquement pendant les heures configurées après 15 secondes d&apos;inactivité.
            </p>

            {/* Configuration des heures */}
            <div className={`space-y-4 transition-opacity ${sleepMode.enabled ? 'opacity-100' : 'opacity-50'}`}>
                <div className="grid grid-cols-2 gap-4">
                    {/* Heure de début */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">
                            Début
                        </label>
                        <input
                            type="time"
                            value={sleepMode.startTime}
                            onChange={(e) => updateSleepMode({ startTime: e.target.value })}
                            disabled={!sleepMode.enabled}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                        text-white text-center
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Heure de fin */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">
                            Fin
                        </label>
                        <input
                            type="time"
                            value={sleepMode.endTime}
                            onChange={(e) => updateSleepMode({ endTime: e.target.value })}
                            disabled={!sleepMode.enabled}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                        text-white text-center
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Option pour arrêter les requêtes */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="stopRequests"
                        checked={sleepMode.stopRequests}
                        onChange={(e) => updateSleepMode({ stopRequests: e.target.checked })}
                        disabled={!sleepMode.enabled}
                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded 
                      focus:ring-blue-500 focus:ring-2
                      disabled:opacity-50"
                    />
                    <label
                        htmlFor="stopRequests"
                        className="text-sm text-gray-400 cursor-pointer"
                    >
                        Arrêter les requêtes API pendant la veille
                    </label>
                </div>
            </div>

            {/* Aperçu de la plage horaire */}
            {sleepMode.enabled && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Plage de veille active</div>
                    <div className="text-sm text-white font-mono">
                        {sleepMode.startTime} → {sleepMode.endTime}
                    </div>
                </div>
            )}
        </div>
    );
}
