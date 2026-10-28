import { apiRequest } from '@/api/http'
import type { Character } from '@/types/character'

export function updateCharacterCombat(
  id: string,
  values: Partial<Pick<Character['combat'], 'armorClass' | 'initiative' | 'speed' | 'hitDice'>>,
): Promise<Character['combat']> {
  return apiRequest<Character['combat']>(`/characters/${id}/combat`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function updateCharacterHits(
  id: string,
  values: Partial<Character['combat']['hp']>,
): Promise<Character['combat']['hp']> {
  return apiRequest<Character['combat']['hp']>(`/characters/${id}/combat/hp`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function updateCharacterDeathSaves(
  id: string,
  values: Partial<Character['combat']['deathSaves']>,
): Promise<Character['combat']['deathSaves']> {
  return apiRequest<Character['combat']['deathSaves']>(`/characters/${id}/combat/death-saves`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}
