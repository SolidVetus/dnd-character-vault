<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
  updateCharacterCombat,
  updateCharacterHp,
  updateCharacterDeathSaves,
  type Character,
} from '../api/characters'

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

const form = reactive({
  armorClass: props.combat.armorClass,
  initiative: props.combat.initiative,
  speed: props.combat.speed,
  hitDice: props.combat.hitDice,
  hp: {
    max: props.combat.hp.max,
    current: props.combat.hp.current,
    temp: props.combat.hp.temp,
  },
  deathSaves: {
    successes: props.combat.deathSaves.successes,
    failures: props.combat.deathSaves.failures,
  },
})

const savingCombat = ref(false)
const savingHp = ref(false)
const savingDeathSaves = ref(false)

watch(
  () => props.combat,
  (combat) => {
    Object.assign(form, {
      armorClass: combat.armorClass,
      initiative: combat.initiative,
      speed: combat.speed,
      hitDice: combat.hitDice,
    })

    Object.assign(form.hp, combat.hp)
    Object.assign(form.deathSaves, combat.deathSaves)
  },
)

async function saveCombat() {
  savingCombat.value = true

  try {
    const combat = await updateCharacterCombat(props.characterId, {
      armorClass: form.armorClass,
      initiative: form.initiative,
      speed: form.speed,
      hitDice: form.hitDice,
    })

    Object.assign(form.hp, combat.hp)
    Object.assign(form.deathSaves, combat.deathSaves)

    emit('updated', combat)
    emit('saved', 'Боевые характеристики сохранены.')
  } catch (err) {
    emit(
      'error',
      err instanceof Error ? err.message : 'Не удалось сохранить боевые характеристики.',
    )
  } finally {
    savingCombat.value = false
  }
}

async function saveHp() {
  savingHp.value = true

  try {
    const hp = await updateCharacterHp(props.characterId, { ...form.hp })

    Object.assign(form.hp, hp)

    emitUpdatedCombat()
    emit('saved', 'Хиты сохранены.')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить хиты.')
  } finally {
    savingHp.value = false
  }
}

async function saveDeathSaves() {
  savingDeathSaves.value = true

  try {
    const deathSaves = await updateCharacterDeathSaves(props.characterId, {
      ...form.deathSaves,
    })

    Object.assign(form.deathSaves, deathSaves)

    emitUpdatedCombat()
    emit('saved', 'Спасброски от смерти сохранены.')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить спасброски от смерти.')
  } finally {
    savingDeathSaves.value = false
  }
}

function emitUpdatedCombat() {
  emit('updated', {
    ...props.combat,
    armorClass: form.armorClass,
    initiative: form.initiative,
    speed: form.speed,
    hitDice: form.hitDice,
    hp: { ...form.hp },
    deathSaves: { ...form.deathSaves },
  })
}

function setDeathSaveSuccesses(value: number) {
  form.deathSaves.successes = form.deathSaves.successes === value ? value - 1 : value
}

function setDeathSaveFailures(value: number) {
  form.deathSaves.failures = form.deathSaves.failures === value ? value - 1 : value
}
</script>

<template>
  <section class="combat-section">
    <h2 class="section-header">Боевые характеристики</h2>

    <v-card class="combat-card" variant="outlined">
      <v-card-text class="combat-card__content">
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.armorClass"
              label="КД"
              type="number"
              min="0"
              max="50"
              density="comfortable"
              @keyup.enter="saveCombat"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.initiative"
              label="Инициатива"
              type="number"
              min="-50"
              max="50"
              density="comfortable"
              @keyup.enter="saveCombat"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.speed"
              label="Скорость"
              type="number"
              min="0"
              max="200"
              density="comfortable"
              @keyup.enter="saveCombat"
            />
          </v-col>
        </v-row>

        <v-btn
          class="combat-card__save-button"
          :loading="savingCombat"
          :disabled="savingCombat"
          @click="saveCombat"
        >
          Сохранить характеристики
        </v-btn>
      </v-card-text>
    </v-card>

    <h2 class="section-header">Хиты</h2>

    <v-card class="combat-card" variant="outlined">
      <v-card-text class="combat-card__content">
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.hp.max"
              label="Максимум хитов"
              type="number"
              min="0"
              max="9999"
              density="comfortable"
              @keyup.enter="saveHp"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.hp.current"
              label="Текущие хиты"
              type="number"
              min="0"
              max="9999"
              density="comfortable"
              @keyup.enter="saveHp"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.hp.temp"
              label="Временные хиты"
              type="number"
              min="0"
              max="9999"
              density="comfortable"
              @keyup.enter="saveHp"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              v-model="form.hitDice"
              label="Кость хитов"
              placeholder="1d8"
              density="comfortable"
              @keyup.enter="saveCombat"
            />
          </v-col>
        </v-row>

        <v-btn
          class="combat-card__save-button"
          :loading="savingHp"
          :disabled="savingHp"
          @click="saveHp"
        >
          Сохранить хиты
        </v-btn>
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
                :aria-pressed="form.deathSaves.successes >= value"
                :color="form.deathSaves.successes >= value ? 'success' : undefined"
                :variant="form.deathSaves.successes >= value ? 'flat' : 'outlined'"
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
                :aria-pressed="form.deathSaves.failures >= value"
                :color="form.deathSaves.failures >= value ? 'error' : undefined"
                :variant="form.deathSaves.failures >= value ? 'flat' : 'outlined'"
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

        <v-btn
          class="combat-card__save-button mt-4"
          :loading="savingDeathSaves"
          :disabled="savingDeathSaves"
          @click="saveDeathSaves"
        >
          Сохранить спасброски
        </v-btn>
      </v-card-text>
    </v-card>
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
  color: var(--text-color);
}

.combat-card :deep(.v-card-text) {
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.combat-card__content {
  color: var(--text-color);
}

.combat-card :deep(.v-divider) {
  border-color: var(--border-color);
  opacity: 1;
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
  background: var(--button-background);
  color: var(--button-text);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.017857em;
  line-height: 1.25rem;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.combat-card__save-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background);
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
</style>
