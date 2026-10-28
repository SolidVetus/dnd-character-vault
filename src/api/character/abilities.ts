import { apiRequest } from '@/api/http'
import type {
  AbilityId,
  CharacterAbility,
  CharacterSavingThrow,
  CharacterSkill,
} from '@/types/character'

export async function updateCharacterAbility(
  id: string,
  ability: AbilityId,
  values: Partial<CharacterAbility>,
): Promise<CharacterAbility> {
  const updatedAbility = await apiRequest<{
    ability: AbilityId
    score: number
    mod: number
  }>(`/characters/${id}/abilities/${ability}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })

  return {
    score: updatedAbility.score,
    mod: updatedAbility.mod,
  }
}

export function updateCharacterSavingThrow(
  id: string,
  ability: AbilityId,
  values: Partial<Pick<CharacterSavingThrow, 'proficient' | 'bonus'>>,
): Promise<CharacterSavingThrow> {
  return apiRequest<CharacterSavingThrow>(`/characters/${id}/saving-throws/${ability}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function updateCharacterSkill(
  id: string,
  skillId: string,
  values: Partial<Pick<CharacterSkill, 'proficient' | 'bonus'>>,
): Promise<CharacterSkill> {
  return apiRequest<CharacterSkill>(`/characters/${id}/skills/${skillId}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function updateProficiencyBonus(id: string, value: number): Promise<{ value: number }> {
  return apiRequest<{ value: number }>(`/characters/${id}/proficiency-bonus`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  })
}

export function updatePassivePerception(id: string, value: number): Promise<{ value: number }> {
  return apiRequest<{ value: number }>(`/characters/${id}/passive-perception`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  })
}

export function updateProficienciesAndLanguages(id: string, items: string[]): Promise<string[]> {
  return apiRequest<string[]>(`/characters/${id}/proficiencies-and-languages`, {
    method: 'PATCH',
    body: JSON.stringify({ items }),
  })
}
