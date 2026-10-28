import { apiRequest } from '@/api/http'
import type { Character, CharacterPreview } from '@/types/character'

export function getAllCharacters(): Promise<CharacterPreview[]> {
  return apiRequest<CharacterPreview[]>('/characters')
}

export function getCharacter(id: string): Promise<Character> {
  return apiRequest<Character>(`/characters/${id}`)
}

export async function createCharacter(): Promise<CharacterPreview> {
  const character = await apiRequest<Character>('/characters', {
    method: 'POST',
  })
  return {
    id: character.id,
    characterName: character.identity.characterName,
    avatarUrl: character.identity.avatarUrl,
  }
}

export function deleteCharacter(id: string): Promise<void> {
  return apiRequest<void>(`/characters/${id}`, {
    method: 'DELETE',
  })
}
