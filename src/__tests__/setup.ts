import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock de fetch global
global.fetch = vi.fn();

// Mock de localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de performance.now()
Object.defineProperty(performance, 'now', {
    value: vi.fn(() => Date.now()),
});

// Reset tous les mocks après chaque test
afterEach(() => {
    vi.clearAllMocks();
});
