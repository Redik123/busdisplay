// Types pour la configuration de l'application Bus Display

export interface Station {
  id: string | null;
  name: string;
}

export interface SleepMode {
  enabled: boolean;
  startTime: string;  // Format "HH:mm"
  endTime: string;
  stopRequests: boolean;
}

export interface ThemeSchedule {
  enabled: boolean;
  startTime: string;  // Heure début thème clair
  endTime: string;    // Heure fin thème clair
}

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'auto';
  schedule: ThemeSchedule;
}

export interface LogoConfig {
  company: string | null;
  partner: string | null;
}

// Types de transport disponibles
export type TransportType = 'bus' | 'tram' | 'metro' | 'train' | 'ship' | 'cableway' | 'all';

export const TRANSPORT_TYPES: { id: TransportType; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tous', emoji: '🚌' },
  { id: 'bus', label: 'Bus', emoji: '🚍' },
  { id: 'tram', label: 'Tram', emoji: '🚊' },
  { id: 'metro', label: 'Métro', emoji: '🚇' },
  { id: 'train', label: 'Train', emoji: '🚆' },
  { id: 'ship', label: 'Bateau', emoji: '⛴️' },
  { id: 'cableway', label: 'Téléphérique', emoji: '🚡' },
];

export interface AppConfig {
  station: Station;
  sleepMode: SleepMode;
  filteredLines: string[];
  filteredDirections: string[];
  filteredCategories: TransportType[];  // Types de transport à afficher
  refreshInterval: number;  // Millisecondes (min: 30000, max: 300000)
  refreshIntervalApproaching: number;  // Millisecondes en mode "à l'approche" (min: 5000, max: 60000)
  theme: ThemeConfig;
  logos: LogoConfig;
}

export const defaultConfig: AppConfig = {
  station: {
    id: null,
    name: 'Sélectionnez une station'
  },
  sleepMode: {
    enabled: false,
    startTime: '23:00',
    endTime: '05:00',
    stopRequests: false
  },
  filteredLines: [],
  filteredDirections: [],
  filteredCategories: ['bus'],  // Par défaut: uniquement les bus
  refreshInterval: 120000,  // 2 minutes
  refreshIntervalApproaching: 15000,  // 15 secondes en mode "à l'approche"
  theme: {
    mode: 'dark',
    schedule: {
      enabled: false,
      startTime: '06:00',
      endTime: '22:00'
    }
  },
  logos: {
    company: null,
    partner: null
  }
};

// Validation de la configuration
export function validateConfig(config: Partial<AppConfig>): AppConfig {
  const validated = { ...defaultConfig, ...config };

  // Valider refreshInterval (30s - 5min)
  if (validated.refreshInterval < 30000) {
    validated.refreshInterval = 30000;
  } else if (validated.refreshInterval > 300000) {
    validated.refreshInterval = 300000;
  }

  // Valider refreshIntervalApproaching (5s - 60s)
  if (validated.refreshIntervalApproaching < 5000) {
    validated.refreshIntervalApproaching = 5000;
  } else if (validated.refreshIntervalApproaching > 60000) {
    validated.refreshIntervalApproaching = 60000;
  }

  return validated;
}
