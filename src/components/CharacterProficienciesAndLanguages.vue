<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateProficienciesAndLanguages } from '../api/characters'

interface Props {
  characterId: string
  items: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [items: string[]]
  saved: [message: string]
  error: [message: string]
}>()

const text = ref(props.items.join('\n'))
const saving = ref(false)

watch(
  () => props.items,
  (newItems) => {
    text.value = newItems.join('\n')
  },
)

async function saveProficienciesAndLanguages() {
  saving.value = true

  try {
    const items = text.value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    const result = await updateProficienciesAndLanguages(props.characterId, items)

    text.value = result.join('\n')
    emit('updated', result)
    emit('saved', 'Владения и языки сохранены.')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить владения и языки.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="proficiencies-languages">
    <h2 class="proficiencies-languages__title">Прочие владения и языки</h2>

    <v-card variant="outlined" max-width="700" class="proficiencies-languages__card">
      <v-textarea
        v-model="text"
        aria-label="Владения и языки"
        hint="Каждое владение или язык указывай с новой строки."
        persistent-hint
        rows="5"
        variant="outlined"
        class="proficiencies-languages__textarea"
      />

      <v-card-actions class="proficiencies-languages__actions">
        <v-spacer />
        <v-btn
          class="proficiencies-languages__save-button"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="saveProficienciesAndLanguages"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </section>
</template>

<style scoped>
.proficiencies-languages {
  color: var(--text-color);
}

.proficiencies-languages__title {
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

.proficiencies-languages__card {
  position: relative;
  overflow: hidden;
  padding: 16px;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
}

.proficiencies-languages__textarea :deep(.v-field) {
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
}

.proficiencies-languages__textarea :deep(.v-field__outline) {
  color: var(--border-color);
}

.proficiencies-languages__textarea :deep(.v-label),
.proficiencies-languages__textarea :deep(.v-field__input),
.proficiencies-languages__textarea :deep(.v-messages) {
  color: var(--text-muted);
  opacity: 1;
}

.proficiencies-languages__textarea :deep(textarea) {
  color: var(--text-color);
  caret-color: var(--accent-color);
}

.proficiencies-languages__textarea :deep(textarea::placeholder) {
  color: var(--text-muted);
  opacity: 1;
}

.proficiencies-languages__textarea :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.proficiencies-languages__textarea :deep(.v-field--focused) {
  color: var(--accent-color);
}

.proficiencies-languages__textarea :deep(.v-field--disabled) {
  opacity: 0.6;
}

.proficiencies-languages__actions {
  padding: 8px 0 0;
}

.proficiencies-languages__save-button {
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
    border-color 0.15s ease,
    color 0.15s ease;
}

.proficiencies-languages__save-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background);
}

.proficiencies-languages__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.proficiencies-languages__save-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
