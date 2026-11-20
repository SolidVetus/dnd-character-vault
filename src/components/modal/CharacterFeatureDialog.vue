<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { CharacterFeature } from '@/types/character'
import { createCharacterFeature, updateCharacterFeature } from '@/api/character/features'

interface Props {
  modelValue: boolean
  characterId: string
  feature: CharacterFeature | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  created: [feature: CharacterFeature]
  updated: [feature: CharacterFeature]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (open: boolean) => emit('update:modelValue', open),
})

const isEditing = computed(() => props.feature !== null)
const form = reactive({
  name: props.feature?.name ?? '',
  description: props.feature?.description ?? '',
})
const nameError = ref('')
const saving = ref(false)

function closeDialog() {
  if (saving.value) return
  dialogOpen.value = false
}

function validateForm(): boolean {
  if (!form.name.trim()) {
    nameError.value = 'Укажите название умения'
    return false
  }

  nameError.value = ''
  return true
}

async function saveFeature(closeAfterSave = false) {
  if (saving.value || !validateForm()) return

  saving.value = true

  try {
    const values = {
      name: form.name.trim(),
      description: form.description.trim(),
    }
    const feature = props.feature
      ? await updateCharacterFeature(props.characterId, props.feature.id, values)
      : await createCharacterFeature(props.characterId, values)

    if (isEditing.value) {
      emit('updated', feature)
      emit('saved', `Умение «${feature.name}» сохранено`)
    } else {
      emit('created', feature)
      emit('saved', `Умение «${feature.name}» добавлено`)
    }

    if (closeAfterSave) dialogOpen.value = false
  } catch (err) {
    emit(
      'error',
      err instanceof Error
        ? err.message
        : isEditing.value
          ? 'Не удалось сохранить умение'
          : 'Не удалось добавить умение',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-dialog
    v-model="dialogOpen"
    :persistent="saving"
    width="560"
    max-width="calc(100vw - 24px)"
    scrollable
  >
    <v-card class="feature-dialog-card">
      <v-card-title class="feature-dialog__title">
        <span>{{
          isEditing ? 'Редактировать умение или особенность' : 'Добавить умение или особенность'
        }}</span>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          aria-label="Закрыть"
          :disabled="saving"
          @click="closeDialog"
        />
      </v-card-title>
      <v-divider />

      <v-form class="feature-dialog__form" @submit.prevent="saveFeature(true)">
        <v-card-text class="feature-dialog__content">
          <v-text-field
            v-model="form.name"
            class="feature-dialog-field"
            label="Название"
            maxlength="200"
            required
            :error-messages="nameError"
            :disabled="saving"
            @update:model-value="nameError = ''"
            @keydown.enter.prevent="saveFeature()"
          />

          <v-textarea
            v-model="form.description"
            class="feature-dialog-field"
            label="Описание"
            maxlength="5000"
            rows="4"
            auto-grow
            :disabled="saving"
          />
        </v-card-text>

        <v-divider />
        <v-card-actions class="feature-dialog__actions">
          <v-spacer />
          <v-btn
            class="feature-dialog__save-button"
            type="submit"
            :loading="saving"
            :disabled="saving"
          >
            {{ isEditing ? 'Сохранить изменения' : 'Добавить умение' }}
          </v-btn>
          <v-btn variant="text" :disabled="saving" @click="closeDialog">Отмена</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.feature-dialog-card {
  max-height: 90dvh;
  overflow: hidden;
  background: var(--page-surface);
  color: var(--text-color);
}

.feature-dialog__title {
  display: flex;
  align-items: center;
  color: var(--heading-color);
  white-space: normal;
}

.feature-dialog__content {
  display: grid;
  gap: 8px;
  padding: 20px 24px;
  color: var(--text-color);
}

.feature-dialog__content :deep(.v-input) {
  min-width: 0;
}

.feature-dialog-card :deep(.v-divider) {
  border-color: var(--border-color);
}

.feature-dialog-field :deep(.v-field) {
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
}

.feature-dialog-field :deep(.v-field__outline) {
  color: var(--border-color);
}

.feature-dialog-field :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.feature-dialog-field :deep(.v-field__input),
.feature-dialog-field :deep(input),
.feature-dialog-field :deep(textarea),
.feature-dialog-field :deep(.v-label) {
  color: var(--text-color);
  opacity: 1;
}

.feature-dialog-field :deep(textarea) {
  line-height: 1.5;
}

.feature-dialog__actions {
  display: flex;
  gap: 8px;
  padding: 16px;
}

.feature-dialog__save-button {
  min-width: 160px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
}

.feature-dialog__save-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.feature-dialog__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .feature-dialog__title {
    padding-inline: 16px;
    font-size: 1.05rem;
  }

  .feature-dialog__content {
    padding: 16px;
  }

  .feature-dialog__actions {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px 16px;
  }

  .feature-dialog__actions :deep(.v-spacer) {
    display: none;
  }

  .feature-dialog__actions :deep(.v-btn) {
    width: 100%;
    min-width: 0;
    margin: 0;
  }
}
</style>
