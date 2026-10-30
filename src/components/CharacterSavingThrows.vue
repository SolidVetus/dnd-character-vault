<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AbilityId, Character } from '@/types/character'
import { updateCharacterSavingThrow } from '../api/character/abilities'

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

const localSavingThrows = ref<Character['savingThrows']>([])
const savingSavingThrow = ref<AbilityId | null>(null)

watch(
  () => props.savingThrows,
  (savingThrows) => {
    localSavingThrows.value = savingThrows.map((savingThrow) => ({ ...savingThrow }))
  },
  { immediate: true, deep: true },
)

async function saveSavingThrow(savingThrow: Character['savingThrows'][number]) {
  if (savingSavingThrow.value !== null) return

  savingSavingThrow.value = savingThrow.ability

  try {
    const updatedSavingThrow = await updateCharacterSavingThrow(
      props.characterId,
      savingThrow.ability,
      {
        proficient: savingThrow.proficient,
        bonus: savingThrow.bonus,
      },
    )

    const index = localSavingThrows.value.findIndex(
      (item) => item.ability === updatedSavingThrow.ability,
    )

    if (index !== -1) {
      localSavingThrows.value[index] = { ...updatedSavingThrow }
    }

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
  <section>
    <h2 class="saving-throws__title">Спасброски</h2>

    <v-card variant="outlined" max-width="700" class="saving-throws__card">
      <v-list density="compact" class="saving-throws__list">
        <v-list-item
          v-for="savingThrow in localSavingThrows"
          :key="savingThrow.ability"
          min-height="42"
          class="saving-throws__item"
        >
          <template #prepend>
            <v-btn
              :icon="savingThrow.proficient ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
              variant="text"
              density="compact"
              size="small"
              class="saving-throws__proficiency-button"
              :aria-label="savingThrow.proficient ? 'Убрать владение' : 'Добавить владение'"
              @click="savingThrow.proficient = !savingThrow.proficient"
            />
          </template>

          <v-list-item-title
            class="saving-throws__name"
            :class="{ 'saving-throws__name--proficient': savingThrow.proficient }"
          >
            {{ savingThrow.name }} ({{ savingThrow.ability.toUpperCase() }})
          </v-list-item-title>

          <template #append>
            <div class="d-flex align-center ga-1">
              <input
                :value="savingThrow.bonus ?? ''"
                :aria-label="`Дополнительный бонус: ${savingThrow.name}`"
                type="number"
                min="-99"
                max="99"
                class="saving-throws__bonus-input"
                @input="
                  (event) => {
                    const value = (event.target as HTMLInputElement).value
                    const parsed = value === '' ? null : Number(value)
                    savingThrow.bonus =
                      parsed === null || !Number.isFinite(parsed) ? null : Math.trunc(parsed)
                  }
                "
                @keydown.enter.prevent="saveSavingThrow(savingThrow)"
              />

              <v-btn
                icon="mdi-content-save"
                variant="text"
                size="small"
                class="saving-throws__save-button"
                :aria-label="`Сохранить спасбросок: ${savingThrow.name}`"
                :loading="savingSavingThrow === savingThrow.ability"
                :disabled="savingSavingThrow !== null"
                @click="saveSavingThrow(savingThrow)"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </section>
</template>

<style scoped>
.saving-throws__title {
  display: block;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 2px solid var(--accent-color);
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.saving-throws__card {
  overflow: hidden;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
}

.saving-throws__list {
  padding: 0;
  background: var(--page-surface);
  color: var(--text-color);
}

.saving-throws__item {
  min-height: 42px;
  padding: 4px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--page-surface);
  color: var(--text-color);
  transition: background-color 0.15s ease;
}

.saving-throws__item:last-child {
  border-bottom: 0;
}

.saving-throws__item:hover {
  background: var(--page-background);
}

.saving-throws__proficiency-button {
  margin-right: 4px;
  color: var(--accent-color);
}

.saving-throws__proficiency-button:hover {
  color: var(--button-hover-border);
}

.saving-throws__name {
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 500;
}

.saving-throws__name--proficient {
  color: var(--heading-color);
  font-weight: 800;
}

.saving-throws__save-button {
  color: var(--accent-color);
}

.saving-throws__save-button:hover {
  color: var(--button-hover-border);
}

.saving-throws__save-button:focus-visible,
.saving-throws__proficiency-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.saving-throws__bonus-input {
  box-sizing: border-box;
  display: block;
  width: 76px;
  min-width: 76px;
  height: 36px;
  padding: 0 6px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  text-align: center;
  appearance: textfield;
  -moz-appearance: textfield;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.saving-throws__bonus-input::-webkit-inner-spin-button,
.saving-throws__bonus-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
}

.saving-throws__bonus-input:hover {
  border-color: var(--card-hover-border);
}

.saving-throws__bonus-input:focus-visible {
  border-color: var(--accent-color);
  outline: 2px solid var(--accent-color);
  outline-offset: 1px;
}

.saving-throws__bonus-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
