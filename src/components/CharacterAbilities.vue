<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { AbilityId, Character } from '@/types/character'
import { updateCharacterAbility } from '../api/character/abilities'

interface Props {
  characterId: string
  abilities: Character['abilities']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [ability: AbilityId, value: { score: number; mod: number }]
}>()

const abilityNames: Record<AbilityId, string> = {
  str: 'Сила',
  dex: 'Ловкость',
  con: 'Телосложение',
  int: 'Интеллект',
  wis: 'Мудрость',
  cha: 'Харизма',
}

const abilityForms = reactive<Record<AbilityId, { score: number; mod: number }>>({
  str: { score: 10, mod: 0 },
  dex: { score: 10, mod: 0 },
  con: { score: 10, mod: 0 },
  int: { score: 10, mod: 0 },
  wis: { score: 10, mod: 0 },
  cha: { score: 10, mod: 0 },
})

watch(
  () => props.abilities,
  (abilities) => {
    for (const ability of Object.keys(abilityNames) as AbilityId[]) {
      Object.assign(abilityForms[ability], abilities[ability])
    }
  },
  { immediate: true, deep: true },
)

const savingAbility = ref<AbilityId | null>(null)
const error = ref('')
const saveMessage = ref('')

async function saveAbility(ability: AbilityId) {
  error.value = ''
  saveMessage.value = ''
  savingAbility.value = ability

  try {
    const updatedAbility = await updateCharacterAbility(props.characterId, ability, {
      score: abilityForms[ability].score,
      mod: abilityForms[ability].mod,
    })

    abilityForms[ability].score = updatedAbility.score
    abilityForms[ability].mod = updatedAbility.mod

    emit('updated', ability, {
      score: updatedAbility.score,
      mod: updatedAbility.mod,
    })

    saveMessage.value = `${abilityNames[ability]}: изменения сохранены.`
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось сохранить характеристику.'
  } finally {
    savingAbility.value = null
  }
}
</script>

<template>
  <section class="abilities-section">
    <h2 class="abilities-section__title">Характеристики</h2>

    <v-row>
      <v-col
        v-for="ability in Object.keys(abilityNames) as AbilityId[]"
        :key="ability"
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card class="ability-card" variant="outlined">
          <v-card-title class="ability-card__title">
            {{ abilityNames[ability] }}
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model.number="abilityForms[ability].score"
              label="Значение"
              type="number"
              min="1"
              max="30"
              density="compact"
            />

            <v-text-field
              v-model.number="abilityForms[ability].mod"
              label="Модификатор"
              type="number"
              min="-10"
              max="10"
              density="compact"
            />

            <v-btn
              class="abilities__save-button"
              block
              :loading="savingAbility === ability"
              :disabled="savingAbility !== null"
              @click="saveAbility(ability)"
            >
              Сохранить
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" class="mt-3">
      {{ error }}
    </v-alert>

    <v-alert v-if="saveMessage" type="success" class="mt-3">
      {{ saveMessage }}
    </v-alert>
  </section>
</template>

<style scoped>
.abilities-section {
  margin-bottom: 24px;
  color: var(--text-color);
}

.abilities-section__title {
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

.ability-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.ability-card:hover {
  border-color: var(--card-hover-border);
  box-shadow: 0 4px 14px rgb(0 0 0 / 10%);
}

.ability-card__title {
  padding-bottom: 4px;
  color: var(--heading-color);
  font-size: 1.05rem;
  font-weight: 700;
}

.ability-card :deep(.v-card-text) {
  color: var(--text-color);
}

.ability-card :deep(.v-field) {
  background: var(--page-surface);
  color: var(--text-color);
}

.ability-card :deep(.v-field__outline) {
  color: var(--border-color);
}

.ability-card :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.ability-card :deep(input),
.ability-card :deep(.v-field__input) {
  color: var(--text-color);
  opacity: 1;
}

.ability-card :deep(.v-label) {
  color: var(--text-muted);
  opacity: 1;
}

.abilities__save-button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
  letter-spacing: 0.017857em;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.abilities__save-button :deep(.v-btn__content) {
  color: var(--button-text) !important;
}

.abilities__save-button:hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.abilities__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.abilities__save-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
