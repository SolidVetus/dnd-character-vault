<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef } from 'vue'
import type { CharacterSavingThrow } from '@/types/character'
import { updateCharacterSavingThrow } from '@/api/character/abilities'
import { useSparkles } from '@/composables/useSparkles'

interface Props {
  modelValue: boolean
  characterId: string
  savingThrow: CharacterSavingThrow
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  updated: [savingThrow: CharacterSavingThrow]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (open: boolean) => emit('update:modelValue', open),
})

const form = reactive({
  proficient: props.savingThrow.proficient,
  bonus: props.savingThrow.bonus,
})
const bonusError = ref('')
const saving = ref(false)
const proficiencyButton = useTemplateRef<HTMLDivElement>('proficiencyButton')
const { playSparkles } = useSparkles()

function closeDialog() {
  if (saving.value) return
  dialogOpen.value = false
}

function updateBonus(value: unknown) {
  bonusError.value = ''

  if (value === null || value === '') {
    form.bonus = null
    return
  }

  const parsed = Number(value)
  form.bonus = Number.isFinite(parsed) ? parsed : null
}

function toggleProficient() {
  const enablingProficiency = !form.proficient
  form.proficient = !form.proficient
  bonusError.value = ''

  if (enablingProficiency) {
    playSparkles(proficiencyButton.value)
  }
}

function validateForm(): boolean {
  if (form.proficient && form.bonus === null) {
    bonusError.value = 'Укажите дополнительный бонус при владении'
    return false
  }

  if (
    form.bonus !== null &&
    (!Number.isInteger(form.bonus) || form.bonus < -1 || form.bonus > 11)
  ) {
    bonusError.value = 'Введите целое число от −1 до 11'
    return false
  }

  bonusError.value = ''
  return true
}

async function saveSavingThrow(closeAfterSave = false) {
  if (saving.value || !validateForm()) return

  saving.value = true

  try {
    const updated = await updateCharacterSavingThrow(props.characterId, props.savingThrow.ability, {
      proficient: form.proficient,
      bonus: form.bonus,
    })

    Object.assign(form, {
      proficient: updated.proficient,
      bonus: updated.bonus,
    })
    emit('updated', updated)
    emit('saved', `Спасбросок «${updated.name}»: изменения сохранены.`)

    if (closeAfterSave) dialogOpen.value = false
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить спасбросок')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-dialog
    v-model="dialogOpen"
    :persistent="saving"
    width="480"
    max-width="calc(100vw - 32px)"
    scrollable
  >
    <v-card class="identity-dialog-card">
      <v-card-title class="identity-dialog__title">
        <span>Редактирование спасброска: {{ props.savingThrow.name }}</span>
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

      <v-card-text class="identity-dialog__content">
        <v-row align="start" justify="center">
          <v-col cols="12" sm="auto">
            <div ref="proficiencyButton" class="proficiency-toggle-wrap">
              <v-btn
                type="button"
                class="proficiency-toggle"
                :class="{ 'proficiency-toggle--active': form.proficient }"
                :prepend-icon="form.proficient ? 'mdi-shield-star' : 'mdi-shield-star-outline'"
                :aria-pressed="form.proficient"
                variant="outlined"
                rounded="pill"
                :disabled="saving"
                @click="toggleProficient"
              >
                Владение
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              :model-value="form.bonus ?? ''"
              class="identity-field saving-throw-bonus-field"
              label="Дополнительный бонус"
              type="number"
              min="-1"
              max="11"
              step="1"
              clearable
              :error-messages="bonusError"
              :disabled="saving"
              @update:model-value="updateBonus"
              @keydown.enter.prevent="saveSavingThrow()"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="section-actions">
        <v-spacer />
        <v-btn
          class="save-identity-btn"
          :loading="saving"
          :disabled="saving"
          @click="saveSavingThrow(true)"
        >
          Сохранить изменения
        </v-btn>
        <v-btn variant="text" :disabled="saving" @click="closeDialog">Отмена</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.identity-dialog-card {
  max-height: 90vh;
  overflow: hidden;
  background: var(--page-surface);
  color: var(--text-color);
}

.identity-dialog__title {
  display: flex;
  align-items: center;
  color: var(--heading-color);
  white-space: normal;
}

.identity-dialog__content {
  color: var(--text-color);
}

.identity-dialog__content :deep(.v-row) {
  margin: -3px;
}

.identity-dialog__content :deep(.v-col) {
  padding: 3px;
}

.identity-dialog-card :deep(.v-divider) {
  border-color: var(--border-color);
}

.identity-field :deep(.v-field) {
  min-height: 64px;
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
}

.identity-field :deep(.v-field__input) {
  min-height: 64px;
  padding-top: 22px;
  padding-bottom: 12px;
  color: var(--text-color);
  font-size: 1.05rem;
}

.identity-field :deep(input::-webkit-inner-spin-button),
.identity-field :deep(input::-webkit-outer-spin-button) {
  appearance: none;
  -webkit-appearance: none;
}

.identity-field :deep(.v-field-label) {
  transform: translateY(-4px);
  color: var(--text-muted);
}

.identity-field :deep(.v-field__outline) {
  color: var(--border-color);
}

.identity-field :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.identity-field :deep(.v-label),
.identity-field :deep(input),
.identity-field :deep(textarea) {
  color: var(--text-color);
  opacity: 1;
}

.identity-field :deep(input::placeholder),
.identity-field :deep(textarea::placeholder) {
  color: var(--text-muted);
  opacity: 1;
}

.identity-field :deep(.v-field--disabled) {
  opacity: 0.6;
}

.saving-throw-bonus-field :deep(.v-field-label) {
  font-size: 0.9rem;
}

.saving-throw-bonus-field :deep(.v-field-label--floating) {
  font-size: 0.7rem;
}

.proficiency-toggle-wrap {
  display: flex;
  width: fit-content;
  margin-inline: auto;
  justify-content: center;
}

.proficiency-toggle {
  min-height: 48px;
  padding: 0 16px;
  border-color: var(--border-color);
  background: var(--page-background);
  color: var(--text-color);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.proficiency-toggle :deep(.v-icon) {
  color: var(--text-muted);
}

.proficiency-toggle--active {
  border-color: var(--accent-color);
  background: color-mix(in srgb, var(--accent-color) 12%, var(--page-background));
  color: var(--heading-color);
}

.proficiency-toggle--active :deep(.v-icon) {
  color: var(--accent-color);
}

.proficiency-toggle:hover:not(:disabled) {
  border-color: var(--accent-color);
  background: color-mix(in srgb, var(--accent-color) 8%, var(--page-background));
}

.proficiency-toggle:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 1px;
}

.proficiency-toggle:disabled {
  opacity: 0.6;
}

.save-identity-btn {
  min-width: 200px;
  border: 1px solid var(--button-border);
  padding: 0;
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.save-identity-btn:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.save-identity-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.save-identity-btn:disabled {
  opacity: 0.6;
}

.section-actions {
  padding: 16px;
}

@media (max-width: 600px) {
  .identity-dialog-card {
    max-height: 90dvh;
  }

  .identity-dialog__title {
    padding-inline: 16px;
    font-size: 1.05rem;
  }

  .identity-dialog__content {
    padding: 16px;
  }

  .save-identity-btn {
    width: 100%;
    min-width: 0;
  }

  .section-actions {
    flex-wrap: wrap;
    padding: 12px 16px;
  }
}
</style>
