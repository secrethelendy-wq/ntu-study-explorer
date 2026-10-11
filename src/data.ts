import json from './data/spaces.json'
import type { Dataset } from './types'
export const dataset = json as Dataset
export const spaces = dataset.spaces
export const asset = (path: string) => {
  const base = typeof window !== 'undefined' && window.location.protocol === 'file:' ? './' : import.meta.env.BASE_URL
  return `${base}${path.replace(/^\/+/, '')}`
}
