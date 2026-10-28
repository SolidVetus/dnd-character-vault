import { apiRequest } from '@/api/http'
import type { EquipmentItem } from '@/types/character'

export interface CharacterCurrency {
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
}

export type EquipmentItemCreate = Omit<EquipmentItem, 'id'>

export function updateCharacterCurrency(
  characterId: string,
  values: Partial<CharacterCurrency>,
): Promise<CharacterCurrency> {
  return apiRequest<CharacterCurrency>(`/characters/${characterId}/currency`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function createEquipmentItem(
  characterId: string,
  values: EquipmentItemCreate,
): Promise<EquipmentItem> {
  return apiRequest<EquipmentItem>(`/characters/${characterId}/equipment/items`, {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateEquipmentItem(
  characterId: string,
  itemId: string,
  values: Partial<EquipmentItemCreate>,
): Promise<EquipmentItem> {
  return apiRequest<EquipmentItem>(`/characters/${characterId}/equipment/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteEquipmentItem(characterId: string, itemId: string): Promise<void> {
  return apiRequest<void>(`/characters/${characterId}/equipment/items/${itemId}`, {
    method: 'DELETE',
  })
}
