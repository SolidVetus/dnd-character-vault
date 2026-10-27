const API_URL = 'http://127.0.0.1:3000/api'
export const API_BASE_URL = API_URL.replace('/api', '')

export interface CharacterPreview {
  id: string
  characterName: string
  avatarUrl: string | null
}

export type AbilityId = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface CharacterAbility {
  score: number
  mod: number
}

export interface CharacterSavingThrow {
  ability: AbilityId
  name: string
  en: string
  proficient: boolean
  bonus: number | null
}

export interface CharacterSkill {
  id: string
  name: string
  en: string
  ability: AbilityId
  proficient: boolean
  bonus: number | null
}

export interface CharacterAttack {
  id: string
  name: string
  attackBonus: number | null
  damage: string
  note: string | null
}

export interface EquipmentItem {
  id: string
  name: string
  quantity: number
  note: string | null
}

export interface CharacterFeature {
  id: string
  name: string
  description: string
}

export interface SpellSlot {
  level: number
  total: number
  used: number
}

export interface CharacterSpell {
  name: string
  level: number
  note: string | null
}

export interface Character {
  id: string
  createdAt: string
  updatedAt: string

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

  abilities: Record<AbilityId, CharacterAbility>
  proficiencyBonus: number
  inspiration: boolean
  passivePerception: number

  savingThrows: CharacterSavingThrow[]
  skills: CharacterSkill[]
  proficienciesAndLanguages: string[]

  combat: {
    armorClass: number
    initiative: number
    speed: number
    hitDice: string
    hp: {
      max: number
      current: number
      temp: number
    }
    deathSaves: {
      successes: number
      failures: number
    }
  }

  attacks: CharacterAttack[]

  equipment: {
    currency: {
      cp: number
      sp: number
      ep: number
      gp: number
      pp: number
    }
    items: EquipmentItem[]
  }

  personality: {
    traits: string
    ideals: string[]
    bonds: string[]
    flaws: string[]
  }

  features: CharacterFeature[]

  spellcasting: {
    ability: AbilityId | null
    saveDc: number | null
    attackBonus: number | null
    slots: SpellSlot[]
    cantrips: CharacterSpell[]
    spells: CharacterSpell[]
  }
}

export type CharacterPersonalityUpdate = Partial<Character['personality']>

export async function updatePersonality(
  id: string,
  values: CharacterPersonalityUpdate,
): Promise<Character['personality']> {
  const response = await fetch(`${API_URL}/characters/${id}/personality`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить личность персонажа')
  }

  return response.json() as Promise<Character['personality']>
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

export type CharacterIdentityUpdate = Partial<
  Pick<
    Character['identity'],
    | 'characterName'
    | 'playerName'
    | 'classLevel'
    | 'race'
    | 'background'
    | 'alignment'
    | 'experiencePoints'
    | 'age'
    | 'notes'
  >
>
export async function updateCharacterAbility(
  id: string,
  ability: AbilityId,
  values: Partial<CharacterAbility>,
): Promise<CharacterAbility> {
  const response = await fetch(`${API_URL}/characters/${id}/abilities/${ability}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить характеристику персонажа')
  }

  const updatedAbility = (await response.json()) as {
    ability: AbilityId
    score: number
    mod: number
  }

  return {
    score: updatedAbility.score,
    mod: updatedAbility.mod,
  }
}

export async function updateCharacterSavingThrow(
  id: string,
  ability: AbilityId,
  values: Partial<Pick<CharacterSavingThrow, 'proficient' | 'bonus'>>,
): Promise<CharacterSavingThrow> {
  const response = await fetch(`${API_URL}/characters/${id}/saving-throws/${ability}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить спасбросок персонажа')
  }

  return response.json() as Promise<CharacterSavingThrow>
}

export async function updateCharacterSkill(
  id: string,
  skillId: string,
  values: Partial<Pick<CharacterSkill, 'proficient' | 'bonus'>>,
): Promise<CharacterSkill> {
  const response = await fetch(`${API_URL}/characters/${id}/skills/${skillId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить навык персонажа')
  }

  return response.json() as Promise<CharacterSkill>
}

export async function updateCharacterIdentity(
  id: string,
  identity: CharacterIdentityUpdate,
): Promise<Character['identity']> {
  const response = await fetch(`${API_URL}/characters/${id}/identity`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(identity),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить основную информацию персонажа')
  }

  return response.json() as Promise<Character['identity']>
}

export async function uploadCharacterAvatar(
  id: string,
  file: File,
): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await fetch(`${API_URL}/characters/${id}/avatar`, {
    method: 'PUT',
    body: formData,
  })

  if (!response.ok) {
    let message = 'Не удалось загрузить аватар.'

    if (response.status === 413) {
      message = 'Изображение слишком большое. Максимальный размер — 5 МиБ.'
    } else {
      try {
        const error = (await response.json()) as { message?: string }
        if (error.message) message = error.message
      } catch (err) {
        console.error(err)
      }
    }

    throw new Error(message)
  }

  return response.json() as Promise<{ avatarUrl: string }>
}

export async function deleteCharacterAvatar(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/characters/${id}/avatar`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    let message = 'Не удалось удалить аватар.'

    try {
      const error = (await response.json()) as { message?: string }
      if (error.message) message = error.message
    } catch (err) {
      console.error(err)
    }

    throw new Error(message)
  }
}

export async function updateProficiencyBonus(
  id: string,
  value: number,
): Promise<{ value: number }> {
  const response = await fetch(`${API_URL}/characters/${id}/proficiency-bonus`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить бонус мастерства')
  }

  return response.json() as Promise<{ value: number }>
}

export async function updatePassivePerception(
  id: string,
  value: number,
): Promise<{ value: number }> {
  const response = await fetch(`${API_URL}/characters/${id}/passive-perception`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить пассивную внимательность')
  }

  return response.json() as Promise<{ value: number }>
}

export async function updateProficienciesAndLanguages(
  id: string,
  items: string[],
): Promise<string[]> {
  const response = await fetch(`${API_URL}/characters/${id}/proficiencies-and-languages`, {
    method: `PATCH`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!response.ok) {
    throw new Error(`Не удалось сохранить владения и языки персонажа`)
  }

  return response.json() as Promise<string[]>
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

export async function updateCharacterCombat(
  id: string,
  values: Partial<Pick<Character['combat'], 'armorClass' | 'initiative' | 'speed' | 'hitDice'>>,
): Promise<Character['combat']> {
  const response = await fetch(`${API_URL}/characters/${id}/combat`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить боевые характеристики')
  }

  return response.json() as Promise<Character['combat']>
}

export async function updateCharacterHp(
  id: string,
  values: Partial<Character['combat']['hp']>,
): Promise<Character['combat']['hp']> {
  const response = await fetch(`${API_URL}/characters/${id}/combat/hp`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить хиты')
  }

  return response.json() as Promise<Character['combat']['hp']>
}

export async function updateCharacterDeathSaves(
  id: string,
  values: Partial<Character['combat']['deathSaves']>,
): Promise<Character['combat']['deathSaves']> {
  const response = await fetch(`${API_URL}/characters/${id}/combat/death-saves`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить спасброски от смерти')
  }

  return response.json() as Promise<Character['combat']['deathSaves']>
}

export async function createCharacterAttack(
  characterId: string,
  values: Omit<CharacterAttack, 'id'>,
): Promise<CharacterAttack> {
  const response = await fetch(`${API_URL}/characters/${characterId}/attacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось добавить атаку')
  }

  return response.json() as Promise<CharacterAttack>
}

export async function updateCharacterAttack(
  characterId: string,
  attackId: string,
  values: Partial<Omit<CharacterAttack, 'id'>>,
): Promise<CharacterAttack> {
  const response = await fetch(`${API_URL}/characters/${characterId}/attacks/${attackId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить атаку')
  }

  return response.json() as Promise<CharacterAttack>
}

export async function deleteCharacterAttack(characterId: string, attackId: string): Promise<void> {
  const response = await fetch(`${API_URL}/characters/${characterId}/attacks/${attackId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить атаку')
  }
}

export type CharacterCurrency = Character['equipment']['currency']

export interface EquipmentItemCreate {
  name: string
  quantity?: number
  note?: string | null
}

export async function updateCharacterCurrency(
  characterId: string,
  values: Partial<CharacterCurrency>,
): Promise<CharacterCurrency> {
  const response = await fetch(`${API_URL}/characters/${characterId}/currency`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить валюту персонажа')
  }

  return response.json() as Promise<CharacterCurrency>
}

export async function createEquipmentItem(
  characterId: string,
  values: EquipmentItemCreate,
): Promise<EquipmentItem> {
  const response = await fetch(`${API_URL}/characters/${characterId}/equipment/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось добавить предмет снаряжения')
  }

  return response.json() as Promise<EquipmentItem>
}

export async function updateEquipmentItem(
  characterId: string,
  itemId: string,
  values: Partial<EquipmentItemCreate>,
): Promise<EquipmentItem> {
  const response = await fetch(`${API_URL}/characters/${characterId}/equipment/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить предмет снаряжения')
  }

  return response.json() as Promise<EquipmentItem>
}

export async function deleteEquipmentItem(characterId: string, itemId: string): Promise<void> {
  const response = await fetch(`${API_URL}/characters/${characterId}/equipment/items/${itemId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить предмет снаряжения')
  }
}

export type CharacterFeatureCreate = Omit<CharacterFeature, 'id'>

export async function createCharacterFeature(
  characterId: string,
  values: CharacterFeatureCreate,
): Promise<CharacterFeature> {
  const response = await fetch(`${API_URL}/characters/${characterId}/features`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось добавить умение персонажа')
  }

  return response.json() as Promise<CharacterFeature>
}

export async function updateCharacterFeature(
  characterId: string,
  featureId: string,
  values: Partial<CharacterFeatureCreate>,
): Promise<CharacterFeature> {
  const response = await fetch(`${API_URL}/characters/${characterId}/features/${featureId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    throw new Error('Не удалось сохранить умение персонажа')
  }

  return response.json() as Promise<CharacterFeature>
}

export async function deleteCharacterFeature(
  characterId: string,
  featureId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/characters/${characterId}/features/${featureId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Не удалось удалить умение персонажа')
  }
}
