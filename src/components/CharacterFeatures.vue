<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CharacterFeature } from '@/types/character'
import { deleteCharacterFeature } from '@/api/character/features'
import CharacterFeatureDialog from './modal/CharacterFeatureDialog.vue'

const props = defineProps<{
  characterId: string
  features: CharacterFeature[]
}>()

const emit = defineEmits<{
  updated: [features: CharacterFeature[]]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = ref(false)
const activeFeatureId = ref<string | null>(null)
const isSaving = ref(false)

const activeFeature = computed(
  () => props.features.find((feature) => feature.id === activeFeatureId.value) ?? null,
)

function startAdding() {
  activeFeatureId.value = null
  dialogOpen.value = true
}

function startEditing(feature: CharacterFeature) {
  activeFeatureId.value = feature.id
  dialogOpen.value = true
}

function handleFeatureCreated(feature: CharacterFeature) {
  emit('updated', [...props.features, feature])
}

function handleFeatureUpdated(updatedFeature: CharacterFeature) {
  emit(
    'updated',
    props.features.map((feature) => (feature.id === updatedFeature.id ? updatedFeature : feature)),
  )
}

async function removeFeature(feature: CharacterFeature) {
  if (!window.confirm(`Удалить умение «${feature.name}»?`)) return

  isSaving.value = true

  try {
    await deleteCharacterFeature(props.characterId, feature.id)

    emit(
      'updated',
      props.features.filter((item) => item.id !== feature.id),
    )
    emit('saved', `Умение «${feature.name}» удалено`)
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось удалить умение')
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
      <p v-if="features.length === 0" class="empty-state">Пока нет добавленных умений.</p>

      <article v-for="feature in features" :key="feature.id" class="feature-item">
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
              class="feature-icon-button"
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
      </article>

      <v-btn
        class="add-feature-button"
        type="button"
        prepend-icon="mdi-plus"
        :disabled="isSaving"
        @click="startAdding"
      >
        Добавить умение
      </v-btn>
    </div>

    <CharacterFeatureDialog
      v-if="dialogOpen"
      :key="activeFeatureId ?? 'new-feature'"
      v-model="dialogOpen"
      :character-id="props.characterId"
      :feature="activeFeature"
      @created="handleFeatureCreated"
      @updated="handleFeatureUpdated"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
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
  background: var(--page-surface);
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
  border-bottom: 1px solid var(--border-color);
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
  background: var(--page-background);
  color: var(--text-color);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-feature-button {
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

.add-feature-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.add-feature-button:focus-visible,
.feature-icon-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.add-feature-button:disabled,
.feature-actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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
  background: var(--page-background);
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 480px) {
  .features-header {
    align-items: flex-start;
  }

  .feature-item {
    padding: 12px;
  }

  .feature-heading {
    align-items: flex-start;
    border-bottom: 1px solid var(--border-color);
  }

  .feature-heading h3 {
    padding-top: 0.4rem;
  }

  .feature-actions {
    gap: 0.35rem;
  }
}
</style>
