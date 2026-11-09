import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCharacter } from '@/api/characters'
import type { AbilityId, Character, CharacterSkill } from '@/types/character'

export const useCharacterStore = defineStore('character', () => {
  const character = ref<Character | null>(null)
  const loading = ref(false)
  const loadError = ref('')

  async function loadCharacter(id: string) {
    loading.value = true
    loadError.value = ''
    character.value = null

    try {
      character.value = await getCharacter(id)
      return true
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Не удалось загрузить персонажа'
      return false
    } finally {
      loading.value = false
    }
  }

  function updateCharacter<K extends keyof Character>(key: K, value: Character[K]) {
    if (!character.value) return

    character.value[key] = value
  }

  function clearCharacter() {
    character.value = null
    loading.value = false
    loadError.value = ''
  }

  function updateAbilities(ability: AbilityId, value: { score: number; mod: number }) {
    if (!character.value) return
    character.value.abilities[ability] = value
  }

  function updateSavingThrow(updatedSavingThrow: Character['savingThrows'][number]) {
    if (!character.value) return
    const index = character.value.savingThrows.findIndex(
      (item) => item.ability === updatedSavingThrow.ability,
    )

    if (index !== -1) {
      character.value.savingThrows[index] = updatedSavingThrow
    }
  }

  function updateSkill(updatedSkill: CharacterSkill) {
    if (!character.value) return

    const index = character.value.skills.findIndex((item) => item.id === updatedSkill.id)

    if (index !== -1) {
      character.value.skills[index] = updatedSkill
    }
  }

  return {
    character,
    loading,
    loadError,
    loadCharacter,
    updateCharacter,
    clearCharacter,
    updateAbilities,
    updateSavingThrow,
    updateSkill,
  }
})
