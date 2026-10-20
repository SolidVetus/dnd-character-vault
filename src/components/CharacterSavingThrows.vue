<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { updateCharacterSavingThrow, type AbilityId, type Character } from '../api/characters'

interface Props {
  characterId: string
  savingThrows: Character['savingThrows']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [savingThrow: Character['savingThrows'][number]]
  error: [message: string]
  saved: [message: string]
}>()

const abilityNames: Record<AbilityId, string> = {
  str: 'Сила',
  dex: 'Ловкость',
  con: 'Телосложение',
  int: 'Интеллект',
  wis: 'Мудрость',
  cha: 'Харизма',
}

const savingThrowForms = reactive<Record<AbilityId, { proficient: boolean; bonus: number | null }>>(
  {
    str: { proficient: false, bonus: null },
    dex: { proficient: false, bonus: null },
    con: { proficient: false, bonus: null },
    int: { proficient: false, bonus: null },
    wis: { proficient: false, bonus: null },
    cha: { proficient: false, bonus: null },
  },
)

const savingSavingThrow = ref<AbilityId | null>(null)

watch(
  () => props.savingThrows,
  (savingThrows) => {
    for (const savingThrow of savingThrows) {
      savingThrowForms[savingThrow.ability].proficient = savingThrow.proficient
      savingThrowForms[savingThrow.ability].bonus = savingThrow.bonus
    }
  },
  { immediate: true, deep: true },
)

async function saveSavingThrow(ability: AbilityId) {
  if (savingSavingThrow.value !== null) return

  savingSavingThrow.value = ability

  try {
    const updatedSavingThrow = await updateCharacterSavingThrow(props.characterId, ability, {
      proficient: savingThrowForms[ability].proficient,
      bonus: savingThrowForms[ability].bonus,
    })

    emit('updated', updatedSavingThrow)
    emit('saved', `Спасбросок «${updatedSavingThrow.name}»: изменения сохранены.`)
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить спасбросок.')
  } finally {
    savingSavingThrow.value = null
  }
}
</script>

<template>
  <section class="mb-6">
    <h2 class="text-h5 mb-3">Спасброски</h2>

    <v-card variant="outlined" max-width="700">
      <v-list density="compact" class="py-1">
        <v-list-item
          v-for="ability in Object.keys(abilityNames) as AbilityId[]"
          :key="ability"
          min-height="42"
          class="px-3"
        >
          <template #prepend>
            <v-btn
              :icon="
                savingThrowForms[ability].proficient ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'
              "
              variant="text"
              density="compact"
              size="small"
              :aria-label="
                savingThrowForms[ability].proficient ? 'Убрать владение' : 'Добавить владение'
              "
              @click="savingThrowForms[ability].proficient = !savingThrowForms[ability].proficient"
            />
          </template>

          <v-list-item-title>
            {{ abilityNames[ability] }}
          </v-list-item-title>

          <template #append>
            <div class="d-flex align-center ga-1">
              <v-text-field
                :model-value="savingThrowForms[ability].bonus ?? ''"
                :aria-label="`Дополнительный бонус: ${abilityNames[ability]}`"
                type="number"
                min="-99"
                max="99"
                clearable
                density="compact"
                variant="plain"
                hide-details
                style="width: 70px"
                @update:model-value="
                  (value) => {
                    savingThrowForms[ability].bonus =
                      value === '' || value === null ? null : Number(value)
                  }
                "
              />

              <v-btn
                icon="mdi-content-save"
                variant="text"
                size="small"
                :aria-label="`Сохранить спасбросок: ${abilityNames[ability]}`"
                :loading="savingSavingThrow === ability"
                :disabled="savingSavingThrow !== null"
                @click="saveSavingThrow(ability)"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </section>
</template>
