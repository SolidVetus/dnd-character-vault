<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Character } from '@/types/character'
import { getAvatarUrl } from '@/utils/avatar'

import {
  uploadCharacterAvatar,
  deleteCharacterAvatar,
  updateCharacterIdentity,
} from '@/api/character/identity'

interface Props {
  characterId: string
  identity: Character['identity']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [identity: Character['identity']]
  saved: [message: string]
  error: [message: string]
}>()

const form = reactive({
  characterName: props.identity.characterName,
  playerName: props.identity.playerName,
  classLevel: props.identity.classLevel,
  race: props.identity.race,
  background: props.identity.background,
  alignment: props.identity.alignment,
  experiencePoints: props.identity.experiencePoints,
  age: props.identity.age,
})

const saving = ref(false)

const avatarBusy = ref(false)
const avatarError = ref('')
const avatarInput = ref<HTMLInputElement | null>(null)

const avatarUrl = computed(() => getAvatarUrl(props.identity.avatarUrl))

function openAvatarPicker() {
  avatarInput.value?.click()
}

async function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) return

  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    avatarError.value = 'Допустимы только изображения PNG, JPEG и WebP.'
    emit('error', avatarError.value)
    return
  }

  avatarBusy.value = true
  avatarError.value = ''

  try {
    const result = await uploadCharacterAvatar(props.characterId, file)

    emit('updated', {
      ...props.identity,
      avatarUrl: result.avatarUrl,
    })

    emit('saved', 'Аватар загружен.')
  } catch (err) {
    avatarError.value = err instanceof Error ? err.message : 'Не удалось загрузить аватар.'

    emit('error', avatarError.value)
  } finally {
    avatarBusy.value = false
  }
}

async function removeAvatar() {
  if (!props.identity.avatarUrl || avatarBusy.value) return

  avatarBusy.value = true
  avatarError.value = ''

  try {
    await deleteCharacterAvatar(props.characterId)

    emit('updated', {
      ...props.identity,
      avatarUrl: null,
    })

    emit('saved', 'Аватар удалён.')
  } catch (err) {
    avatarError.value = err instanceof Error ? err.message : 'Не удалось удалить аватар.'

    emit('error', avatarError.value)
  } finally {
    avatarBusy.value = false
  }
}

watch(
  () => props.identity,
  (identity) => {
    Object.assign(form, {
      characterName: identity.characterName,
      playerName: identity.playerName,
      classLevel: identity.classLevel,
      race: identity.race,
      background: identity.background,
      alignment: identity.alignment,
      experiencePoints: identity.experiencePoints,
      age: identity.age,
    })
  },
)

async function saveIdentity() {
  if (!form.characterName.trim()) {
    emit('error', 'Укажите имя персонажа.')
    return
  }

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

    Object.assign(form, identity)
    emit('updated', identity)
    emit('saved', 'Изменения сохранены.')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить изменения.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="saveIdentity">
    <div class="section-header">
      <h2>Основная информация</h2>
    </div>
    <v-card width="100%" class="character-identity">
      <v-card-text class="section-content">
        <v-alert v-if="avatarError" type="error" variant="tonal" density="compact" class="mb-4">
          {{ avatarError }}
        </v-alert>

        <v-row align="start">
          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.characterName"
                  class="identity-field"
                  label="Имя персонажа"
                  :rules="[(value: string) => !!value?.trim() || 'Укажите имя персонажа']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="form.playerName" class="identity-field" label="Имя игрока" />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.classLevel"
                  class="identity-field"
                  label="Класс и уровень"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="form.race" class="identity-field" label="Раса" />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.background"
                  class="identity-field"
                  label="Предыстория"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.alignment"
                  class="identity-field"
                  label="Мировоззрение"
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
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" md="4">
            <div class="avatar-section">
              <div class="character-avatar mb-2">
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
                :disabled="avatarBusy"
                @change="onAvatarSelected"
              />

              <v-btn
                class="avatar-upload-btn"
                :loading="avatarBusy"
                :disabled="avatarBusy"
                @click="openAvatarPicker"
              >
                {{ props.identity.avatarUrl ? 'Заменить аватар' : 'Загрузить аватар' }}
              </v-btn>

              <v-btn
                v-if="props.identity.avatarUrl"
                color="error"
                variant="text"
                :loading="avatarBusy"
                :disabled="avatarBusy"
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
        <v-card-actions class="section-actions">
          <v-spacer />
          <v-btn class="save-identity-btn" type="submit" :loading="saving" :disabled="saving">
            Сохранить изменения
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<style scoped>
.character-identity {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-bottom: 10px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--accent-color);
}

.section-header h2 {
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

.section-content {
  padding: 16px;
  color: var(--text-color);
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

.avatar-upload-btn,
.save-identity-btn {
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.avatar-upload-btn {
  width: 100%;
  max-width: 280px;
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
  padding-top: 16px;
}

.avatar-section :deep(.text-caption) {
  color: var(--text-muted);
  line-height: 1.6;
}

.character-identity :deep(.v-alert) {
  border-color: var(--delete-border);
  background: var(--delete-background);
  color: var(--delete-text);
}

.character-identity :deep(.v-alert__content) {
  color: var(--delete-text);
}

.character-identity :deep(.v-btn--variant-text.text-error) {
  color: var(--delete-text) !important;
}

.character-identity :deep(.v-btn--variant-text.text-error:hover) {
  background: var(--delete-hover-background);
}

@media (max-width: 600px) {
  .section-content {
    padding: 12px;
  }

  .character-avatar {
    max-width: 240px;
    height: 240px;
  }

  .avatar-upload-btn {
    max-width: 240px;
  }

  .save-identity-btn {
    width: 100%;
    min-width: 0;
  }
}
</style>
