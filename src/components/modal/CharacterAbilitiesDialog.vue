<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { AbilityId, Character } from '@/types/character'
import { updateCharacterAbility } from '@/api/character/abilities'

interface Props {
  modelValue: boolean
  characterId: string
  ability: AbilityId
  abilities: Character['abilities']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  updated: [ability: AbilityId, value: { score: number; mod: number }]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (open: boolean) => emit('update:modelValue', open),
})

const abilityNames: Record<AbilityId, string> = {
  str: 'Сила',
  dex: 'Ловкость',
  con: 'Телосложение',
  int: 'Интеллект',
  wis: 'Мудрость',
  cha: 'Харизма',
}

const form = reactive({ ...props.abilities[props.ability] })
const abilityError = ref('')
const modError = ref('')
const saving = ref(false)

function clearErrors() {
  abilityError.value = ''
  modError.value = ''
}

function validateForm(): boolean {
  if (!Number.isInteger(form.score) || form.score < 1 || form.score > 30) {
    abilityError.value = 'Значение должно быть целым числом от 1 до 30'
    return false
  }

  if (!Number.isInteger(form.mod) || form.mod < -10 || form.mod > 10) {
    modError.value = 'Модификатор должен быть целым числом от −10 до 10'
    return false
  }

  abilityError.value = ''
  modError.value = ''
  return true
}

function closeDialog() {
  if (saving.value) return
  dialogOpen.value = false
}

async function saveAbility(closeAfterSave = false) {
  if (saving.value || !validateForm()) return

  saving.value = true

  try {
    const updated = await updateCharacterAbility(props.characterId, props.ability, {
      score: form.score,
      mod: form.mod,
    })

    Object.assign(form, updated)
    emit('updated', props.ability, updated)
    emit('saved', `${abilityNames[props.ability]} сохранена`)

    if (closeAfterSave) dialogOpen.value = false
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить характеристику')
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
        <span>Редактирование: {{ abilityNames[props.ability] }}</span>
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
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.score"
              class="identity-field"
              label="Значение"
              type="number"
              min="1"
              max="30"
              step="1"
              :error-messages="abilityError"
              :disabled="saving"
              @update:model-value="clearErrors"
              @keydown.enter.prevent="saveAbility()"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.mod"
              class="identity-field"
              label="Модификатор"
              type="number"
              min="-10"
              max="10"
              step="1"
              :error-messages="modError"
              :disabled="saving"
              @update:model-value="clearErrors"
              @keydown.enter.prevent="saveAbility()"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- <v-divider /> -->
      <v-card-actions class="section-actions">
        <v-spacer />
        <v-btn
          class="save-identity-btn"
          :loading="saving"
          :disabled="saving"
          @click="saveAbility(true)"
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
