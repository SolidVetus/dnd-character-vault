import { apiRequest } from '@/api/http'
import type { CharacterAttack } from '@/types/character'

export function createCharacterAttack(
  characterId: string,
  values: Omit<CharacterAttack, 'id'>,
): Promise<CharacterAttack> {
  return apiRequest<CharacterAttack>(`/characters/${characterId}/attacks`, {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateCharacterAttack(
  characterId: string,
  attackId: string,
  values: Partial<Omit<CharacterAttack, 'id'>>,
): Promise<CharacterAttack> {
  return apiRequest<CharacterAttack>(`/characters/${characterId}/attacks/${attackId}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteCharacterAttack(characterId: string, attackId: string): Promise<void> {
  return apiRequest<void>(`/characters/${characterId}/attacks/${attackId}`, {
    method: 'DELETE',
  })
}
