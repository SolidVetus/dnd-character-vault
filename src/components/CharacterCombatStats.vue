<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Character } from '@/types/character'
import { updateCharacterDeathSaves } from '../api/character/combat'
import CharacterCombatDialog from './modal/CharacterCombatDialog.vue'

type CombatDialogSection = 'combat' | 'hits'

interface Props {
  characterId: string
  combat: Character['combat']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [combat: Character['combat']]
  saved: [message: string]
  error: [message: string]
}>()

const deathSaves = reactive({ ...props.combat.deathSaves })
const savingDeathSaves = ref(false)
const activeDialog = ref<CombatDialogSection | null>(null)

const dialogOpen = computed({
  get: () => activeDialog.value !== null,
  set: (open: boolean) => {
    if (!open) activeDialog.value = null
  },
})

const combatStats = computed(() => [
  { label: 'КД', value: String(props.combat.armorClass) },
  {
    label: 'Инициатива',
    value: props.combat.initiative > 0 ? `+${props.combat.initiative}` : String(props.combat.initiative),
  },
  { label: 'Скорость', value: String(props.combat.speed) },
])

const hitStats = computed(() => [
  { label: 'Максимум хитов', value: String(props.combat.hp.max) },
  { label: 'Текущие хиты', value: String(props.combat.hp.current) },
  { label: 'Временные хиты', value: String(props.combat.hp.temp) },
  { label: 'Кость хитов', value: props.combat.hitDice },
])

watch(
  () => props.combat.deathSaves,
  (value) => Object.assign(deathSaves, value),
  { immediate: true, deep: true },
)

function openDialog(section: CombatDialogSection) {
  activeDialog.value = section
}

async function saveDeathSaves() {
  savingDeathSaves.value = true

  try {
    const updatedDeathSaves = await updateCharacterDeathSaves(props.characterId, {
      ...deathSaves,
    })

    Object.assign(deathSaves, updatedDeathSaves)
    emit('updated', {
      ...props.combat,
      deathSaves: { ...deathSaves },
    })
    emit('saved', 'Спасброски от смерти сохранены')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить спасброски от смерти')
  } finally {
    savingDeathSaves.value = false
  }
}

function setDeathSaveSuccesses(value: number) {
  deathSaves.successes = deathSaves.successes === value ? value - 1 : value
}

function setDeathSaveFailures(value: number) {
  deathSaves.failures = deathSaves.failures === value ? value - 1 : value
}
</script>

<template>
  <section class="combat-section">
    <h2 class="section-header">Боевые характеристики</h2>

    <v-card class="combat-card" variant="outlined">
      <v-card-text class="combat-card__content">
        <div class="combat-summary">
          <div v-for="stat in combatStats" :key="stat.label" class="combat-summary__item">
            <span class="combat-summary__label">{{ stat.label }}</span>
            <strong class="combat-summary__value">{{ stat.value }}</strong>
          </div>
        </div>

        <div class="combat-card__actions">
          <v-btn
            class="combat-card__edit-button"
            prepend-icon="mdi-pencil"
            @click="openDialog('combat')"
          >
            Редактировать
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <h2 class="section-header">Хиты</h2>

    <v-card class="combat-card" variant="outlined">
      <v-card-text class="combat-card__content">
        <div class="combat-summary">
          <div v-for="stat in hitStats" :key="stat.label" class="combat-summary__item">
            <span class="combat-summary__label">{{ stat.label }}</span>
            <strong class="combat-summary__value">{{ stat.value }}</strong>
          </div>
        </div>

        <div class="combat-card__actions">
          <v-btn
            class="combat-card__edit-button"
            prepend-icon="mdi-pencil"
            @click="openDialog('hits')"
          >
            Редактировать
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <h2 class="section-header">Спасброски от смерти</h2>

    <v-card class="combat-card" variant="outlined">
      <v-card-text class="combat-card__content">
        <div class="death-saves">
          <div class="death-saves__row">
            <span class="death-saves__label">Успехи</span>

            <div
              class="death-saves__circles"
              role="group"
              aria-label="Успешные спасброски от смерти"
            >
              <v-btn
                v-for="value in [1, 2, 3]"
                :key="`success-${value}`"
                :aria-label="`Успех ${value}`"
                :aria-pressed="deathSaves.successes >= value"
                :color="deathSaves.successes >= value ? 'success' : undefined"
                :variant="deathSaves.successes >= value ? 'flat' : 'outlined'"
                icon
                size="small"
                class="death-saves__circle"
                :disabled="savingDeathSaves"
                @click="setDeathSaveSuccesses(value)"
              >
                <span class="death-saves__dot" />
              </v-btn>
            </div>
          </div>

          <div class="death-saves__row">
            <span class="death-saves__label">Неудачи</span>

            <div
              class="death-saves__circles"
              role="group"
              aria-label="Неудачные спасброски от смерти"
            >
              <v-btn
                v-for="value in [1, 2, 3]"
                :key="`failure-${value}`"
                :aria-label="`Неудача ${value}`"
                :aria-pressed="deathSaves.failures >= value"
                :color="deathSaves.failures >= value ? 'error' : undefined"
                :variant="deathSaves.failures >= value ? 'flat' : 'outlined'"
                icon
                size="small"
                class="death-saves__circle"
                :disabled="savingDeathSaves"
                @click="setDeathSaveFailures(value)"
              >
                <span class="death-saves__dot" />
              </v-btn>
            </div>
          </div>
        </div>

        <div class="combat-card__actions">
          <v-btn
            class="combat-card__save-button"
            :loading="savingDeathSaves"
            :disabled="savingDeathSaves"
            @click="saveDeathSaves"
          >
            Сохранить спасброски
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <CharacterCombatDialog
      v-if="activeDialog"
      :key="activeDialog"
      v-model="dialogOpen"
      :character-id="props.characterId"
      :combat="props.combat"
      :section="activeDialog"
      @updated="emit('updated', $event)"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.section-header {
  display: block;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--accent-color);
  background: transparent !important;
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.combat-card {
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--page-surface) !important;
}

.combat-card :deep(.v-card-text) {
  color: var(--text-color);
}

.combat-card__content {
  color: var(--text-color);
}

.combat-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 100px), 1fr));
  gap: 8px;
}

.combat-summary__item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--page-background);
  text-align: center;
}

.combat-summary__label {
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.combat-summary__value {
  color: var(--heading-color);
  font-size: 1.1rem;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.combat-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.combat-card :deep(.v-field) {
  border-radius: 8px;
  background: var(--page-surface);
  color: var(--text-color);
}

.combat-card :deep(.v-field__outline) {
  color: var(--border-color);
}

.combat-card :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.combat-card :deep(.v-field__input),
.combat-card :deep(input),
.combat-card :deep(textarea) {
  color: var(--text-color);
  opacity: 1;
}

.combat-card :deep(.v-label) {
  color: var(--text-muted);
  opacity: 1;
}

.combat-card :deep(.v-field--disabled) {
  background: var(--page-background);
  opacity: 0.7;
}

.combat-card__save-button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  font-weight: 600;
  letter-spacing: 0.017857em;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.combat-card__save-button:hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.combat-card__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.combat-card__save-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.combat-card__save-button :deep(.v-btn__content) {
  color: var(--button-text);
}

.combat-card__edit-button {
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

.combat-card__edit-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.combat-card__edit-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.combat-card__edit-button :deep(.v-btn__content) {
  color: var(--button-text);
}

.death-saves {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-background);
  color: var(--text-color);
}

.death-saves__row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-left: 8px;
}

.death-saves__label {
  width: 100px;
  color: var(--text-muted);
  font-weight: 600;
}

.death-saves__circles {
  display: flex;
  gap: 8px;
}

.death-saves__circle {
  flex-shrink: 0;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.death-saves__circle:hover:not(:disabled) {
  border-color: var(--card-hover-border);
}

.death-saves__circle:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.death-saves__circle :deep(.v-btn__overlay) {
  opacity: 0;
}

.death-saves__dot {
  width: 10px;
  height: 10px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

@media (max-width: 400px) {
  .death-saves {
    padding: 12px;
  }

  .death-saves__row {
    gap: 12px;
  }

  .death-saves__label {
    width: 84px;
  }
}

@media (max-width: 600px) {
  .combat-card__actions {
    justify-content: center;
  }
}
</style>
