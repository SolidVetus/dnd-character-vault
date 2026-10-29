<script setup lang="ts">
import { ref } from 'vue'
import type { CharacterFeature } from '@/types/character'

import {
  createCharacterFeature,
  updateCharacterFeature,
  deleteCharacterFeature,
} from '@/api/character/features'

const props = defineProps<{
  characterId: string
  features: CharacterFeature[]
}>()

const emit = defineEmits<{
  updated: [features: CharacterFeature[]]
}>()

const isAdding = ref(false)
const editingId = ref<string | null>(null)
const isSaving = ref(false)
const errorMessage = ref('')

const newFeature = ref({ name: '', description: '' })
const editedFeature = ref({ name: '', description: '' })

function startAdding() {
  newFeature.value = { name: '', description: '' }
  isAdding.value = true
  editingId.value = null
  errorMessage.value = ''
}

function startEditing(feature: CharacterFeature) {
  editedFeature.value = {
    name: feature.name,
    description: feature.description,
  }
  editingId.value = feature.id
  isAdding.value = false
  errorMessage.value = ''
}

async function addFeature() {
  const name = newFeature.value.name.trim()

  if (!name) {
    errorMessage.value = 'Укажите название умения.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const feature = await createCharacterFeature(props.characterId, {
      name,
      description: newFeature.value.description.trim(),
    })

    emit('updated', [...props.features, feature])
    isAdding.value = false
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось добавить умение.'
  } finally {
    isSaving.value = false
  }
}

async function saveFeature(feature: CharacterFeature) {
  const name = editedFeature.value.name.trim()

  if (!name) {
    errorMessage.value = 'Укажите название умения.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const updatedFeature = await updateCharacterFeature(props.characterId, feature.id, {
      name,
      description: editedFeature.value.description.trim(),
    })

    emit(
      'updated',
      props.features.map((item) => (item.id === updatedFeature.id ? updatedFeature : item)),
    )

    editingId.value = null
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось сохранить умение.'
  } finally {
    isSaving.value = false
  }
}

async function removeFeature(feature: CharacterFeature) {
  if (!window.confirm(`Удалить умение «${feature.name}»?`)) return

  isSaving.value = true
  errorMessage.value = ''

  try {
    await deleteCharacterFeature(props.characterId, feature.id)

    emit(
      'updated',
      props.features.filter((item) => item.id !== feature.id),
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось удалить умение.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="character-features">
    <header class="features-header">
      <h2>Умения и особенности</h2>
    </header>

    <div class="features-container">
      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>

      <form v-if="isAdding" class="feature-form" @submit.prevent="addFeature">
        <label>
          Название
          <input v-model="newFeature.name" maxlength="200" required />
        </label>

        <label>
          Описание
          <textarea v-model="newFeature.description" maxlength="5000" rows="3" />
        </label>

        <div class="feature-actions">
          <button type="submit" :disabled="isSaving">
            {{ isSaving ? 'Сохранение…' : 'Сохранить' }}
          </button>
          <button type="button" :disabled="isSaving" @click="isAdding = false">Отмена</button>
        </div>
      </form>

      <p v-if="features.length === 0 && !isAdding" class="empty-state">
        Пока нет добавленных умений.
      </p>

      <article v-for="feature in features" :key="feature.id" class="feature-item">
        <form
          v-if="editingId === feature.id"
          class="feature-form"
          @submit.prevent="saveFeature(feature)"
        >
          <label>
            Название
            <input v-model="editedFeature.name" maxlength="200" required />
          </label>

          <label>
            Описание
            <textarea v-model="editedFeature.description" maxlength="5000" rows="3" />
          </label>

          <div class="feature-actions">
            <button type="submit" :disabled="isSaving">
              {{ isSaving ? 'Сохранение…' : 'Сохранить' }}
            </button>
            <button type="button" :disabled="isSaving" @click="editingId = null">Отмена</button>
          </div>
        </form>

        <template v-else>
          <div class="feature-heading">
            <h3>{{ feature.name }}</h3>

            <div class="feature-actions">
              <button
                class="feature-icon-button"
                type="button"
                :disabled="isSaving"
                :aria-label="`Изменить умение ${feature.name}`"
                title="Изменить"
                @click="startEditing(feature)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>
              </button>

              <button
                class="feature-icon-button feature-icon-button--delete"
                type="button"
                :disabled="isSaving"
                :aria-label="`Удалить умение ${feature.name}`"
                title="Удалить"
                @click="removeFeature(feature)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="m19 6-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </button>
            </div>
          </div>

          <p v-if="feature.description" class="feature-description">
            {{ feature.description }}
          </p>
        </template>
      </article>

      <v-btn
        v-if="!isAdding"
        class="add-feature-button"
        type="button"
        prepend-icon="mdi-plus"
        :disabled="isSaving"
        @click="startAdding"
      >
        Добавить умение
      </v-btn>
    </div>
  </section>
</template>

<style scoped>
.character-features {
  display: grid;
  gap: 1rem;
  color: var(--text-color);
}

.features-container {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--page-background);
  color: var(--text-color);
}

.features-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--accent-color);
}

.features-header h2 {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.feature-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.feature-heading h3 {
  margin: 0;
  color: var(--heading-color);
  font-size: 1rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.feature-item {
  display: grid;
  gap: 0.75rem;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-item:hover {
  border-color: var(--card-hover-border);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.feature-form {
  display: grid;
  gap: 0.9rem;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
}

.feature-form label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.feature-form input,
.feature-form textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  background: var(--page-background);
  color: var(--text-color);
  font: inherit;
  font-size: 0.95rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.feature-form input:hover,
.feature-form textarea:hover {
  border-color: var(--card-hover-border);
}

.feature-form input:focus-visible,
.feature-form textarea:focus-visible {
  border-color: var(--accent-color);
  outline: 2px solid var(--accent-color);
  outline-offset: 1px;
}

.feature-form input:disabled,
.feature-form textarea:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.feature-form textarea {
  min-height: 80px;
  resize: vertical;
}

.feature-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-feature-button,
.feature-actions button:not(.feature-icon-button) {
  flex: 0 0 auto;
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

.add-feature-button:hover:not(:disabled),
.feature-actions button:not(.feature-icon-button):hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.add-feature-button:focus-visible,
.feature-actions button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.add-feature-button:disabled,
.feature-actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.feature-actions button[type='button']:not(.feature-icon-button) {
  border-color: var(--border-color);
  background: var(--page-surface);
  color: var(--text-color);
}

.feature-actions button[type='button']:not(.feature-icon-button):hover:not(:disabled) {
  border-color: var(--card-hover-border);
  background: var(--page-background);
  color: var(--accent-color);
}

.feature-actions .feature-icon-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  padding: 7px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--accent-color);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.feature-icon-button svg {
  display: block;
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.feature-actions .feature-icon-button:hover:not(:disabled) {
  border-color: var(--card-hover-border);
  background: var(--page-background);
  color: var(--button-hover-border);
}

.feature-actions .feature-icon-button--delete {
  color: var(--delete-text);
}

.feature-actions .feature-icon-button--delete:hover:not(:disabled) {
  border-color: var(--delete-hover-border);
  background: var(--delete-hover-background);
  color: var(--delete-text);
}

.feature-actions .feature-icon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.feature-description,
.empty-state {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.empty-state {
  padding: 1rem;
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-muted);
  text-align: center;
}

.error-message {
  margin: 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--delete-border);
  border-radius: 8px;
  background: var(--delete-background);
  color: var(--delete-text);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .features-header {
    align-items: flex-start;
  }

  .feature-form {
    padding: 12px;
  }

  .feature-item {
    padding: 12px;
  }

  .feature-heading {
    align-items: flex-start;
  }

  .feature-heading h3 {
    padding-top: 0.4rem;
  }

  .feature-actions {
    gap: 0.35rem;
  }
}
</style>
