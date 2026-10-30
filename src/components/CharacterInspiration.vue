<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateInspiration } from '../api/character/abilities'

interface Props {
  characterId: string
  inspiration: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [value: boolean]
  saved: [message: string]
  error: [message: string]
}>()

const inspiration = ref(props.inspiration)
const saving = ref(false)

watch(
  () => props.inspiration,
  (value) => {
    inspiration.value = value
  },
)

async function saveInspiration(value: boolean) {
  if (saving.value) return

  const previousValue = inspiration.value
  inspiration.value = value
  saving.value = true

  try {
    const result = await updateInspiration(props.characterId, value)
    inspiration.value = result.value
    emit('updated', result.value)
    emit('saved', 'Вдохновение сохранено.')
  } catch (err) {
    inspiration.value = previousValue
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить вдохновение.')
  } finally {
    saving.value = false
  }
}

function toggleInspiration() {
  if (saving.value) return
  saveInspiration(!inspiration.value)
}
</script>

<template>
  <section>
    <h2 class="inspiration__title">Вдохновение</h2>

    <v-card variant="outlined" max-width="700" class="inspiration__card">
      <div class="inspiration__content">
        <button
          type="button"
          class="inspiration-toggle"
          :class="{ 'inspiration-toggle--active': inspiration }"
          role="switch"
          :aria-checked="inspiration"
          :disabled="saving"
          :aria-label="inspiration ? 'Убрать вдохновение' : 'Получить вдохновение'"
          @click="toggleInspiration"
        >
          <v-icon
            class="inspiration-toggle__icon"
            :icon="inspiration ? 'mdi-star-four-points' : 'mdi-star-four-points-outline'"
            size="36"
          />
        </button>
      </div>
    </v-card>
  </section>
</template>

<style scoped>
.inspiration__title {
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

.inspiration__content {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
}

.inspiration__card {
  padding: 16px;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
}

.inspiration-toggle {
  width: 68px;
  height: 68px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--page-background);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.inspiration-toggle:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  transform: scale(1.06);
}

.inspiration-toggle:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.inspiration-toggle:disabled {
  cursor: wait;
  opacity: 0.65;
}

.inspiration-toggle--active {
  border-color: var(--accent-color);
  background: color-mix(in srgb, var(--accent-color) 12%, var(--page-background));
  box-shadow: 0 0 14px color-mix(in srgb, var(--accent-color) 25%, transparent);
}

.inspiration-toggle__icon {
  color: var(--text-color);
  transition:
    color 0.2s ease,
    filter 0.2s ease,
    transform 0.2s ease;
}

.inspiration-toggle--active .inspiration-toggle__icon {
  color: var(--accent-color);
  filter: drop-shadow(0 0 7px color-mix(in srgb, var(--accent-color) 55%, transparent));
  transform: scale(1.1);
}
</style>
