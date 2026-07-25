/** Cambiar a `real` cuando el backend esté listo. Una sola variable. */
export const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? 'mock') as
  | 'mock'
  | 'real'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export const isMock = DATA_SOURCE === 'mock'
