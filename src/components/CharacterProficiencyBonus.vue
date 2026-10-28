<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateProficiencyBonus } from '../api/character/abilities'

interface Props {
  characterId: string
  proficiencyBonus: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [value: number]
  saved: [message: string]
  error: [message: string]
}>()

const proficiencyBonus = ref(props.proficiencyBonus)
const saving = ref(false)

watch(
  () => props.proficiencyBonus,
  (value) => {
    proficiencyBonus.value = value
  },
)

async function saveProficiencyBonus() {
  if (
    !Number.isInteger(proficiencyBonus.value) ||
    proficiencyBonus.value < 0 ||
    proficiencyBonus.value > 10
  ) {
    emit('error', 'Бонус мастерства должен быть целым числом от 0 до 10.')
    return
  }

  saving.value = true

  try {
    const result = await updateProficiencyBonus(props.characterId, proficiencyBonus.value)
    proficiencyBonus.value = result.value
    emit('updated', result.value)
    emit('saved', 'Бонус мастерства сохранён.')
  } catch (err) {
    emit(
      'error',

      err instanceof Error ? err.message : 'Не удалось сохранить бонус мастерства.',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="mb-6">
    <h2 class="proficiency-bonus__title">Бонус мастерства</h2>

    <v-card variant="outlined" max-width="700" class="proficiency-bonus__card">
      <div class="proficiency-bonus__content">
        <input
          id="proficiency-bonus-value"
          v-model.number="proficiencyBonus"
          aria-label="Бонус мастерства"
          type="number"
          min="0"
          max="10"
          step="1"
          class="proficiency-bonus__input"
          @keydown.enter.prevent="saveProficiencyBonus"
        />
      </div>

      <v-btn
        icon="mdi-content-save"
        variant="text"
        size="small"
        class="proficiency-bonus__save-button"
        aria-label="Сохранить бонус мастерства"
        :loading="saving"
        :disabled="saving"
        @click="saveProficiencyBonus"
      />
    </v-card>
  </section>
</template>

<style scoped>
.proficiency-bonus__title {
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

.proficiency-bonus__content {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
}

.proficiency-bonus__card {
  position: relative;
  overflow: hidden;
  padding: 16px;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
}

.proficiency-bonus__input {
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

.proficiency-bonus__input::-webkit-inner-spin-button,
.proficiency-bonus__input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
}

.proficiency-bonus__input:hover {
  border-color: var(--card-hover-border);
}

.proficiency-bonus__input:focus-visible {
  border-color: var(--accent-color);
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.proficiency-bonus__save-button {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  color: var(--accent-color);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.proficiency-bonus__save-button:hover {
  color: var(--button-hover-border);
}

.proficiency-bonus__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.proficiency-bonus__save-button:disabled {
  opacity: 0.6;
}
</style>
