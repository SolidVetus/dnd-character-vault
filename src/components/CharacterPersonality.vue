<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Character } from '@/types/character'
import { updatePersonality } from '../api/character/identity'

interface Props {
  characterId: string
  personality: Character['personality']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [personality: Character['personality']]
  saved: [message: string]
  error: [message: string]
}>()

type PersonalityField = 'traits' | 'ideals' | 'bonds' | 'flaws'

const text = reactive<Record<PersonalityField, string>>({
  traits: '',
  ideals: '',
  bonds: '',
  flaws: '',
})

const saving = reactive<Record<PersonalityField, boolean>>({
  traits: false,
  ideals: false,
  bonds: false,
  flaws: false,
})

const sections: {
  field: PersonalityField
  title: string
  label: string
  hint: string
}[] = [
  {
    field: 'traits',
    title: 'Черты характера',
    label: 'Черты характера',
    hint: 'Опиши черты характера.',
  },
  {
    field: 'ideals',
    title: 'Идеалы',
    label: 'Идеалы',
    hint: 'Каждый идеал указывай с новой строки.',
  },
  {
    field: 'bonds',
    title: 'Привязанности',
    label: 'Привязанности',
    hint: 'Каждую привязанность указывай с новой строки.',
  },
  {
    field: 'flaws',
    title: 'Слабости',
    label: 'Слабости',
    hint: 'Каждую слабость указывай с новой строки.',
  },
]

function syncText() {
  text.traits = props.personality.traits ?? ''
  text.ideals = (props.personality.ideals ?? []).join('\n')
  text.bonds = (props.personality.bonds ?? []).join('\n')
  text.flaws = (props.personality.flaws ?? []).join('\n')
}

watch(() => props.personality, syncText, {
  immediate: true,
  deep: true,
})

function getPayload(field: PersonalityField) {
  if (field === 'traits') {
    return {
      traits: text.traits.trim(),
    }
  }

  const values = text[field]
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

  return {
    [field]: values,
  }
}

function syncSavedField(field: PersonalityField, personality: Character['personality']) {
  if (field === 'traits') {
    text.traits = personality.traits ?? ''
    return
  }

  text[field] = (personality[field] ?? []).join('\n')
}

async function saveField(field: PersonalityField) {
  if (saving[field]) return

  saving[field] = true

  try {
    const personality = await updatePersonality(props.characterId, getPayload(field))

    syncSavedField(field, personality)
    emit('updated', personality)

    const section = sections.find((item) => item.field === field)
    emit('saved', `${section?.title} сохранены.`)
  } catch (err) {
    const section = sections.find((item) => item.field === field)
    const title = section?.title ?? 'Данные'

    emit(
      'error',
      err instanceof Error ? err.message : `Не удалось сохранить: ${title.toLowerCase()}.`,
    )
  } finally {
    saving[field] = false
  }
}
</script>

<template>
  <div class="personality-stack">
    <section v-for="section in sections" :key="section.field" class="personality-section">
      <h2 class="personality-section__title">
        {{ section.title }}
      </h2>

      <v-card variant="outlined" class="personality-block">
        <v-textarea
          v-model="text[section.field]"
          :aria-label="section.label"
          :hint="section.hint"
          persistent-hint
          rows="1"
          auto-grow
          variant="outlined"
          :maxlength="section.field === 'traits' ? 5000 : 1000"
          class="personality-block__textarea"
        />

        <v-card-actions class="personality-block__actions">
          <v-spacer />

          <v-btn
            class="personality-block__save-button"
            variant="flat"
            :loading="saving[section.field]"
            :disabled="saving[section.field]"
            @click="saveField(section.field)"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </section>
  </div>
</template>

<style scoped>
.personality-stack {
  display: grid;
  gap: 24px;
  color: var(--text-color);
}

.personality-section__title {
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

.personality-block {
  position: relative;
  overflow: hidden;
  padding: 16px;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.personality-block:hover {
  border-color: var(--card-hover-border);
}

.personality-block__textarea :deep(.v-field) {
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
}

.personality-block__textarea :deep(.v-field__outline) {
  color: var(--border-color);
}

.personality-block__textarea :deep(.v-label),
.personality-block__textarea :deep(.v-field__input),
.personality-block__textarea :deep(.v-messages) {
  color: var(--text-color);
  opacity: 1;
}

.personality-block__textarea :deep(.v-field__input textarea) {
  color: var(--text-color);
  caret-color: var(--accent-color);
}

.personality-block__textarea :deep(.v-field__input textarea::placeholder) {
  color: var(--text-muted);
  opacity: 1;
}

.personality-block__textarea :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.personality-block__textarea :deep(.v-field--focused) {
  color: var(--accent-color);
}

.personality-block__textarea :deep(textarea) {
  resize: vertical;
  overflow-y: auto;
}

.personality-block__textarea :deep(.v-field__input) {
  min-height: 56px;
  max-height: 400px;
  overflow-y: auto;
}

.personality-block__textarea :deep(.v-field--disabled) {
  opacity: 0.6;
}

.personality-block__actions {
  padding: 8px 0 0;
}

.personality-block__save-button {
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

.personality-block__save-button:hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.personality-block__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.personality-block__save-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .personality-stack {
    gap: 20px;
  }

  .personality-block {
    padding: 14px;
  }
}
</style>
