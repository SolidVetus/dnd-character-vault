import { apiRequest } from '@/api/http'
import type { Character } from '@/types/character'

export type CharacterIdentityUpdate = Partial<Character['identity']>
export type CharacterPersonalityUpdate = Partial<Character['personality']>

export function updateCharacterIdentity(
  id: string,
  identity: CharacterIdentityUpdate,
): Promise<Character['identity']> {
  return apiRequest<Character['identity']>(`/characters/${id}/identity`, {
    method: 'PATCH',
    body: JSON.stringify(identity),
  })
}

export function updatePersonality(
  id: string,
  values: CharacterPersonalityUpdate,
): Promise<Character['personality']> {
  return apiRequest<Character['personality']>(`/characters/${id}/personality`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export async function uploadCharacterAvatar(
  id: string,
  file: File,
): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    return await apiRequest<{ avatarUrl: string }>(`/characters/${id}/avatar`, {
      method: 'PUT',
      body: formData,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('413')) {
      throw new Error('Изображение слишком большое. Максимальный размер — 5 МиБ.')
    }

    throw error
  }
}

export function deleteCharacterAvatar(id: string): Promise<void> {
  return apiRequest<void>(`/characters/${id}/avatar`, {
    method: 'DELETE',
  })
}
