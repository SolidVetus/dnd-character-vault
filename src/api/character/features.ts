import { apiRequest } from '@/api/http'
import type { CharacterFeature } from '@/types/character'

export type CharacterFeatureCreate = Omit<CharacterFeature, 'id'>

export function createCharacterFeature(
  characterId: string,
  values: CharacterFeatureCreate,
): Promise<CharacterFeature> {
  return apiRequest<CharacterFeature>(`/characters/${characterId}/features`, {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateCharacterFeature(
  characterId: string,
  featureId: string,
  values: Partial<CharacterFeatureCreate>,
): Promise<CharacterFeature> {
  return apiRequest<CharacterFeature>(`/characters/${characterId}/features/${featureId}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteCharacterFeature(characterId: string, featureId: string): Promise<void> {
  return apiRequest<void>(`/characters/${characterId}/features/${featureId}`, {
    method: 'DELETE',
  })
}
