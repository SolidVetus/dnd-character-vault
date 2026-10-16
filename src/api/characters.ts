const API_URL = 'http://127.0.0.1:3000/api'

export interface CharacterPreview {
  id: string
  characterName: string
  avatarUrl: string | null
}

export interface Character {
  id: string
  identity: {
    characterName: string
    playerName: string
    classLevel: string
    race: string
    background: string
    alignment: string
    experiencePoints: number
    age: number | null
    notes: string[]
    avatarUrl: string | null
  }
}

export async function getAllCharacters(): Promise<CharacterPreview[]> {
  const response = await fetch(`${API_URL}/characters`)

  if (!response.ok) {
    throw new Error('Не удалось загрузить персонажей')
  }

  return response.json() as Promise<CharacterPreview[]>
}

export async function getCharacter(id: string): Promise<Character> {
  const response = await fetch(`${API_URL}/characters/${id}`)

  if (!response.ok) {
    throw new Error('Не удалось загрузить лист персонажа')
  }

  return response.json() as Promise<Character>
}

export async function createCharacter(): Promise<CharacterPreview> {
  const response = await fetch(`${API_URL}/characters`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Не удалось создать персонажа')
  }

  const character = await response.json()

  return {
    id: character.id,
    characterName: character.identity.characterName,
    avatarUrl: character.identity.avatarUrl,
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/characters/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить персонажа')
  }
}
