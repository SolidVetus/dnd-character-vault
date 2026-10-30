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

async function saveAbility(ability: AbilityId) {
  error.value = ''
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

    <div class="abilities-list">
      <v-card
        v-for="ability in Object.keys(abilityNames) as AbilityId[]"
        :key="ability"
        class="ability-card"
        variant="flat"
      >
        <div class="ability-card__inner">
          <div class="ability-card__name">
            {{ abilityNames[ability] }}
          </div>

          <div class="ability-card__score">
            <v-text-field
              v-model.number="abilityForms[ability].score"
              type="number"
              min="1"
              max="30"
              variant="plain"
              density="compact"
              hide-details
              single-line
              @keydown.enter.prevent="saveAbility(ability)"
            />
          </div>

          <div class="ability-card__modifier">
            <v-text-field
              v-model.number="abilityForms[ability].mod"
              type="number"
              min="-10"
              max="10"
              variant="plain"
              density="compact"
              hide-details
              single-line
              @keydown.enter.prevent="saveAbility(ability)"
            />
          </div>

          <div class="ability-card__modifier-label">МОДИФИКАТОР</div>

          <v-btn
            class="abilities__save-button"
            size="small"
            variant="text"
            :loading="savingAbility === ability"
            :disabled="savingAbility !== null"
            @click="saveAbility(ability)"
          >
            Сохранить
          </v-btn>
        </div>
      </v-card>
    </div>

    <v-alert v-if="error" type="error" class="mt-3">
      {{ error }}
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
  margin: 0 0 20px;
  padding: 0 0 10px;
  border-bottom: 2px solid var(--accent-color);
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.abilities-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.ability-card {
  position: relative;
  width: 100%;
  min-height: 210px;
  padding: 7px;
  overflow: visible;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--page-surface);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.ability-card:hover {
  border-color: var(--card-hover-border);
  box-shadow: 0 4px 14px rgb(0 0 0 / 12%);
}

.ability-card__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 194px;
  padding: 12px 14px 8px;
}

.ability-card__name {
  width: 100%;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--border-color);
  color: var(--heading-color);
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
}

.ability-card__score {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  min-height: 75px;
}

.ability-card__score :deep(.v-field) {
  width: 100%;
  background: transparent;
  color: var(--text-color);
}

.ability-card__score :deep(.v-field__input) {
  min-height: 65px;
  padding: 0;
  color: var(--heading-color);
  font-size: 2.7rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}

.ability-card__score :deep(input) {
  text-align: center;
}

.ability-card__score :deep(.v-field__outline) {
  display: none;
}

.ability-card__modifier {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 52px;
  margin-top: 4px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  background: var(--page-background);
  box-shadow: 0 2px 5px rgb(0 0 0 / 8%);
}

.ability-card__modifier :deep(.v-field) {
  width: 100%;
  background: transparent;
  color: var(--heading-color);
}

.ability-card__modifier :deep(.v-field__input) {
  min-height: 40px;
  padding: 0;
  color: var(--heading-color);
  font-size: 1.3rem;
  font-weight: 800;
  text-align: center;
}

.ability-card__modifier :deep(input) {
  width: 100%;
  padding: 0;
  text-align: center;
  appearance: textfield;
}

.ability-card__modifier :deep(input::-webkit-inner-spin-button),
.ability-card__modifier :deep(input::-webkit-outer-spin-button) {
  appearance: none;
  -webkit-appearance: none;
}

.ability-card__modifier :deep(.v-field__outline) {
  display: none;
}

.ability-card__modifier-label {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.abilities__save-button {
  min-height: 38px;
  margin-top: 8px;
  padding: 8px 14px;
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
  opacity: 0.55;
}

@media (max-width: 480px) {
  .ability-card {
    max-width: 210px;
  }
}
</style>
