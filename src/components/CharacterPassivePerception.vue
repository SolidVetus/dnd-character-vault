<script setup lang="ts">
import { ref, watch } from 'vue'
import { updatePassivePerception } from '../api/characters'

interface Props {
  characterId: string
  passivePerception: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [value: number]
  saved: [message: string]
  error: [message: string]
}>()

const value = ref(props.passivePerception)
const saving = ref(false)

watch(
  () => props.passivePerception,
  (newValue) => {
    value.value = newValue
  },
)

async function savePassivePerception() {
  if (saving.value) return

  if (!Number.isInteger(value.value) || value.value < 0 || value.value > 99) {
    emit('error', 'Пассивная внимательность должна быть целым числом от 0 до 99.')
    return
  }

  saving.value = true

  try {
    const result = await updatePassivePerception(props.characterId, value.value)

    value.value = result.value
    emit('updated', result.value)
    emit('saved', 'Пассивная внимательность сохранена.')
  } catch (err) {
    emit(
      'error',
      err instanceof Error ? err.message : 'Не удалось сохранить пассивную внимательность.',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="mb-6 passive-perception">
    <h2 class="passive-perception__title">Пассивная внимательность</h2>

    <v-card variant="outlined" max-width="700" class="passive-perception__card">
      <div class="passive-perception__content">
        <input
          id="passive-perception-value"
          v-model.number="value"
          aria-label="Пассивная внимательность"
          type="number"
          min="0"
          max="99"
          step="1"
          class="passive-perception__input"
          @keydown.enter.prevent="savePassivePerception"
        />

        <v-btn
          icon="mdi-content-save"
          variant="text"
          size="small"
          class="passive-perception__save-button"
          aria-label="Сохранить пассивную внимательность"
          :loading="saving"
          :disabled="saving"
          @click="savePassivePerception"
        />
      </div>
    </v-card>
  </section>
</template>

<style scoped>
.passive-perception {
  color: var(--text-color);
}

.passive-perception__title {
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

.passive-perception__card {
  overflow: hidden;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
}

.passive-perception__content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 12px;
  color: var(--text-color);
}

.passive-perception__input {
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
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.passive-perception__input::-webkit-inner-spin-button,
.passive-perception__input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
}

.passive-perception__input:hover {
  border-color: var(--card-hover-border);
}

.passive-perception__input:focus-visible {
  border-color: var(--accent-color);
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.passive-perception__save-button {
  position: absolute;
  right: 8px;
  color: var(--accent-color);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.passive-perception__save-button:hover {
  color: var(--button-hover-border);
}

.passive-perception__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.passive-perception__save-button:disabled {
  opacity: 0.6;
}

@media (max-width: 480px) {
  .passive-perception__content {
    padding: 10px;
  }

  .passive-perception__save-button {
    right: 4px;
  }
}
</style>
