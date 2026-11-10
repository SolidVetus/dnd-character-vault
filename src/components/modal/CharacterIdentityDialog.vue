<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import type { Character } from '@/types/character'
import { getAvatarUrl } from '@/utils/avatar'
import {
  deleteCharacterAvatar,
  updateCharacterIdentity,
  uploadCharacterAvatar,
} from '@/api/character/identity'

interface Props {
  modelValue: boolean
  characterId: string
  identity: Character['identity']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  updated: [identity: Character['identity']]
  saved: [message: string]
  error: [message: string]
}>()

const { smAndDown } = useDisplay()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (open: boolean) => emit('update:modelValue', open),
})

function getFormValues(identity: Character['identity']) {
  return {
    characterName: identity.characterName,
    playerName: identity.playerName,
    classLevel: identity.classLevel,
    race: identity.race,
    background: identity.background,
    alignment: identity.alignment,
    experiencePoints: identity.experiencePoints,
    age: identity.age,
  }
}

const form = reactive(getFormValues(props.identity))
type IdentityField = keyof typeof form

const saving = ref(false)
const savingField = ref<IdentityField | null>(null)
const identityForm = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const isSaving = computed(() => saving.value || savingField.value !== null)

const fieldErrors = reactive<Record<IdentityField, string>>({
  characterName: '',
  playerName: '',
  classLevel: '',
  race: '',
  background: '',
  alignment: '',
  experiencePoints: '',
  age: '',
})

const fieldValidationMessages: Record<IdentityField, string> = {
  characterName: 'Укажите имя персонажа',
  playerName: 'Укажите имя игрока',
  classLevel: 'Укажите класс и уровень',
  race: 'Укажите расу',
  background: 'Укажите предысторию',
  alignment: 'Укажите мировоззрение',
  experiencePoints: 'Укажите опыт',
  age: 'Укажите возраст',
}

const avatarBusy = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarUrl = computed(() => getAvatarUrl(props.identity.avatarUrl))

function syncForm(identity: Character['identity'] = props.identity) {
  Object.assign(form, getFormValues(identity))
}

function requiredInput(value: unknown, message: string): true | string {
  if (typeof value === 'number') return Number.isFinite(value) ? true : message
  return String(value ?? '').trim().length > 0 ? true : message
}

function clearFieldError(field: IdentityField) {
  fieldErrors[field] = ''
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return

    syncForm()
    for (const field of Object.keys(fieldErrors) as IdentityField[]) {
      fieldErrors[field] = ''
    }
  },
)

watch(
  () => props.identity,
  (identity) => {
    if (!dialogOpen.value) syncForm(identity)
  },
)

function closeDialog() {
  if (isSaving.value) return
  dialogOpen.value = false
}

function openAvatarPicker() {
  avatarInput.value?.click()
}

async function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) return

  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    emit('error', 'Допустимы только изображения PNG, JPEG и WebP')
    return
  }

  avatarBusy.value = true

  try {
    const result = await uploadCharacterAvatar(props.characterId, file)

    emit('updated', {
      ...props.identity,
      avatarUrl: result.avatarUrl,
    })
    emit('saved', 'Аватар загружен')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось загрузить аватар')
  } finally {
    avatarBusy.value = false
  }
}

async function removeAvatar() {
  if (!props.identity.avatarUrl || avatarBusy.value) return

  avatarBusy.value = true

  try {
    await deleteCharacterAvatar(props.characterId)

    emit('updated', {
      ...props.identity,
      avatarUrl: null,
    })

    emit('saved', 'Аватар удалён')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось удалить аватар')
  } finally {
    avatarBusy.value = false
  }
}

async function saveIdentity() {
  if (isSaving.value) return

  const validation = await identityForm.value?.validate()
  if (!validation?.valid) return

  saving.value = true

  try {
    const identity = await updateCharacterIdentity(props.characterId, {
      characterName: form.characterName.trim(),
      playerName: form.playerName,
      classLevel: form.classLevel,
      race: form.race,
      background: form.background,
      alignment: form.alignment,
      experiencePoints: form.experiencePoints,
      age: form.age,
    })

    Object.assign(form, getFormValues(identity))
    emit('updated', identity)
    emit('saved', 'Изменения сохранены')
    dialogOpen.value = false
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить изменения')
  } finally {
    saving.value = false
  }
}

async function saveIdentityField(field: IdentityField) {
  if (isSaving.value) return

  const validation = requiredInput(form[field], fieldValidationMessages[field])
  if (validation !== true) {
    fieldErrors[field] = validation
    return
  }

  fieldErrors[field] = ''
  savingField.value = field

  try {
    const value = field === 'characterName' ? form.characterName.trim() : form[field]
    const identity = await updateCharacterIdentity(props.characterId, {
      [field]: value,
    } as Partial<Character['identity']>)

    Object.assign(form, { [field]: identity[field] })
    emit('updated', identity)
    emit('saved', 'Изменение сохранено')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить изменения')
  } finally {
    savingField.value = null
  }
}
</script>

<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="smAndDown"
    :persistent="isSaving"
    max-width="900"
    scrollable
  >
    <v-card class="identity-dialog-card">
      <v-card-title class="identity-dialog__title">
        <span>Редактирование основной информации</span>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          aria-label="Закрыть"
          :disabled="isSaving"
          @click="closeDialog"
        />
      </v-card-title>
      <v-divider />

      <v-card-text class="identity-dialog__content">
        <v-form id="identity-form" ref="identityForm" @submit.prevent="saveIdentity">
          <v-row align="start">
            <v-col cols="12" sm="8">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.characterName"
                    class="identity-field"
                    label="Имя персонажа"
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите имя персонажа')]"
                    :error-messages="fieldErrors.characterName"
                    :loading="savingField === 'characterName'"
                    :disabled="isSaving"
                    clearable
                    @update:model-value="clearFieldError('characterName')"
                    @keydown.enter.prevent="saveIdentityField('characterName')"
                    required
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.playerName"
                    class="identity-field"
                    label="Имя игрока"
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите имя игрока')]"
                    :error-messages="fieldErrors.playerName"
                    :loading="savingField === 'playerName'"
                    :disabled="isSaving"
                    clearable
                    @update:model-value="clearFieldError('playerName')"
                    @keydown.enter.prevent="saveIdentityField('playerName')"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.classLevel"
                    class="identity-field"
                    label="Класс и уровень"
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите класс и уровень')]"
                    :error-messages="fieldErrors.classLevel"
                    :loading="savingField === 'classLevel'"
                    :disabled="isSaving"
                    clearable
                    @update:model-value="clearFieldError('classLevel')"
                    @keydown.enter.prevent="saveIdentityField('classLevel')"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.race"
                    class="identity-field"
                    label="Раса"
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите расу')]"
                    :error-messages="fieldErrors.race"
                    :loading="savingField === 'race'"
                    :disabled="isSaving"
                    clearable
                    @update:model-value="clearFieldError('race')"
                    @keydown.enter.prevent="saveIdentityField('race')"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.background"
                    class="identity-field"
                    label="Предыстория"
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите предысторию')]"
                    :error-messages="fieldErrors.background"
                    :loading="savingField === 'background'"
                    :disabled="isSaving"
                    clearable
                    @update:model-value="clearFieldError('background')"
                    @keydown.enter.prevent="saveIdentityField('background')"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.alignment"
                    class="identity-field"
                    label="Мировоззрение"
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите мировоззрение')]"
                    :error-messages="fieldErrors.alignment"
                    :loading="savingField === 'alignment'"
                    :disabled="isSaving"
                    clearable
                    @update:model-value="clearFieldError('alignment')"
                    @keydown.enter.prevent="saveIdentityField('alignment')"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.experiencePoints"
                    label="Опыт"
                    class="identity-field"
                    type="number"
                    min="0"
                    max="9999999"
                    clearable
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите опыт')]"
                    :error-messages="fieldErrors.experiencePoints"
                    :loading="savingField === 'experiencePoints'"
                    :disabled="isSaving"
                    @update:model-value="clearFieldError('experiencePoints')"
                    @keydown.enter.prevent="saveIdentityField('experiencePoints')"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.age"
                    label="Возраст"
                    class="identity-field"
                    type="number"
                    min="0"
                    max="9999"
                    clearable
                    :rules="[(value: unknown) => requiredInput(value, 'Укажите возраст')]"
                    :error-messages="fieldErrors.age"
                    :loading="savingField === 'age'"
                    :disabled="isSaving"
                    @update:model-value="clearFieldError('age')"
                    @keydown.enter.prevent="saveIdentityField('age')"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="4">
              <div class="avatar-section">
                <div class="character-avatar character-avatar--editor mb-2">
                  <v-img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    alt="Аватар персонажа"
                    contain
                    width="100%"
                    height="100%"
                  />
                  <v-icon v-else icon="mdi-account-circle" size="220" />
                </div>

                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  class="d-none"
                  :disabled="avatarBusy || isSaving"
                  @change="onAvatarSelected"
                />

                <v-btn
                  class="avatar-upload-btn"
                  type="button"
                  :loading="avatarBusy"
                  :disabled="avatarBusy || isSaving"
                  @click="openAvatarPicker"
                >
                  {{ props.identity.avatarUrl ? 'Заменить аватар' : 'Загрузить аватар' }}
                </v-btn>

                <v-btn
                  v-if="props.identity.avatarUrl"
                  type="button"
                  color="error"
                  variant="text"
                  :loading="avatarBusy"
                  :disabled="avatarBusy || isSaving"
                  @click="removeAvatar"
                >
                  Удалить аватар
                </v-btn>

                <div class="text-caption text-medium-emphasis">
                  PNG, JPEG или WebP.<br />
                  Максимальный размер — 5mb.
                </div>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions class="section-actions">
        <v-spacer />
        <v-btn
          class="save-identity-btn"
          type="submit"
          form="identity-form"
          :loading="saving"
          :disabled="isSaving"
        >
          Сохранить изменения
        </v-btn>
        <v-btn variant="text" :disabled="isSaving" @click="closeDialog">Отмена</v-btn>
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
  gap: 12px;
  color: var(--heading-color);
  white-space: normal;
}

.identity-dialog__content {
  padding: 20px 24px;
  color: var(--text-color);
}

.identity-dialog__content :deep(.v-row) {
  margin: -6px;
}

.identity-dialog__content :deep(.v-col) {
  padding: 6px;
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

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-color);
  text-align: center;
}

.character-avatar {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  max-width: 280px;
  height: 280px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--image-background);
  color: var(--text-muted);
}

.character-avatar :deep(.v-img) {
  width: 100%;
  height: 100%;
}

.character-avatar :deep(.v-icon) {
  color: var(--text-muted);
}

.character-avatar--editor {
  max-width: 240px;
  height: 240px;
}

.avatar-upload-btn,
.save-identity-btn {
  border: 1px solid var(--button-border);
  padding: 0;
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.avatar-upload-btn {
  width: 100%;
  max-width: 240px;
}

.save-identity-btn {
  min-width: 200px;
}

.avatar-upload-btn:hover:not(:disabled),
.save-identity-btn:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.avatar-upload-btn:focus-visible,
.save-identity-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

.avatar-upload-btn:disabled,
.save-identity-btn:disabled {
  opacity: 0.6;
}

.section-actions {
  padding: 16px;
}

.avatar-section :deep(.text-caption) {
  color: var(--text-muted);
  line-height: 1.6;
}

.identity-dialog-card :deep(.v-btn--variant-text.text-error) {
  color: var(--delete-text) !important;
}

.identity-dialog-card :deep(.v-btn--variant-text.text-error:hover) {
  background: var(--delete-hover-background);
}

@media (max-width: 600px) {
  .identity-dialog-card {
    max-height: 100dvh;
    border-radius: 0;
  }

  .identity-dialog__title {
    padding-inline: 16px;
    font-size: 1.05rem;
  }

  .identity-dialog__content {
    padding: 16px;
  }

  .avatar-upload-btn {
    max-width: 240px;
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
