<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { CharacterAttack } from '@/types/character'
import {
  createCharacterAttack,
  deleteCharacterAttack,
  updateCharacterAttack,
} from '@/api/character/attacks'

interface Props {
  modelValue: boolean
  characterId: string
  attack: CharacterAttack | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  created: [attack: CharacterAttack]
  updated: [attack: CharacterAttack]
  deleted: [attackId: string]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (open: boolean) => emit('update:modelValue', open),
})

const form = reactive({
  name: props.attack?.name ?? '',
  attackBonus: props.attack?.attackBonus ?? null,
  damage: props.attack?.damage ?? '',
})

const nameError = ref('')
const bonusError = ref('')
const damageError = ref('')
const saving = ref(false)
const isEditing = computed(() => props.attack !== null)
const dialogTitle = computed(() =>
  isEditing.value ? 'Редактирование атаки/заклинания' : 'Добавление атаки/заклинания',
)

function closeDialog() {
  if (saving.value) return
  dialogOpen.value = false
}

function updateBonus(value: unknown) {
  bonusError.value = ''

  if (value === null || value === '') {
    form.attackBonus = null
    return
  }

  const parsed = Number(value)
  form.attackBonus = Number.isFinite(parsed) ? parsed : null
}

function validateForm(): boolean {
  let valid = true

  if (!form.name.trim()) {
    nameError.value = 'Укажите название атаки или заклинания'
    valid = false
  } else {
    nameError.value = ''
  }

  if (!isEditing.value && form.attackBonus === null) {
    bonusError.value = 'Укажите бонус атаки'
    valid = false
  } else if (
    form.attackBonus !== null &&
    (!Number.isInteger(form.attackBonus) || form.attackBonus < -99 || form.attackBonus > 99)
  ) {
    bonusError.value = 'Введите целое число от −99 до 99'
    valid = false
  } else {
    bonusError.value = ''
  }

  if (!form.damage.trim()) {
    damageError.value = 'Укажите урон или вид атаки'
    valid = false
  } else {
    damageError.value = ''
  }

  return valid
}

async function saveAttack(closeAfterSave = false) {
  if (saving.value || !validateForm()) return

  saving.value = true

  try {
    const values = {
      name: form.name.trim(),
      attackBonus: form.attackBonus,
      damage: form.damage.trim(),
    }

    if (props.attack) {
      const updated = await updateCharacterAttack(props.characterId, props.attack.id, values)
      Object.assign(form, {
        name: updated.name,
        attackBonus: updated.attackBonus,
        damage: updated.damage,
      })
      emit('updated', updated)
      emit('saved', `Атака «${updated.name}» сохранена`)
    } else {
      const created = await createCharacterAttack(props.characterId, {
        ...values,
        note: null,
      })
      emit('created', created)
      emit('saved', `Атака «${created.name}» добавлена`)
    }

    if (closeAfterSave) dialogOpen.value = false
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить атаку')
  } finally {
    saving.value = false
  }
}

async function deleteAttack() {
  if (!props.attack || saving.value) return
  if (!window.confirm(`Удалить атаку «${props.attack.name}»?`)) return

  saving.value = true

  try {
    await deleteCharacterAttack(props.characterId, props.attack.id)
    emit('deleted', props.attack.id)
    emit('saved', `Атака «${props.attack.name}» удалена`)
    dialogOpen.value = false
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось удалить атаку')
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
    <v-card class="attack-dialog-card">
      <v-card-title class="attack-dialog__title">
        <span>{{ dialogTitle }}</span>
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

      <v-form class="attack-dialog__form" @submit.prevent="saveAttack(true)">
        <v-card-text class="attack-dialog__content">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                class="attack-dialog-field"
                label="Название атаки или заклинания"
                maxlength="200"
                required
                :error-messages="nameError"
                :disabled="saving"
                @update:model-value="nameError = ''"
                @keydown.enter.prevent="saveAttack()"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="form.attackBonus ?? ''"
                class="attack-dialog-field"
                label="Бонус атаки"
                type="number"
                min="-99"
                max="99"
                step="1"
                clearable
                :required="!isEditing"
                :error-messages="bonusError"
                :disabled="saving"
                @update:model-value="updateBonus"
                @keydown.enter.prevent="saveAttack()"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.damage"
                class="attack-dialog-field"
                label="Урон/вид"
                maxlength="200"
                required
                :error-messages="damageError"
                :disabled="saving"
                @update:model-value="damageError = ''"
                @keydown.enter.prevent="saveAttack()"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="attack-dialog__actions">
          <v-btn
            v-if="isEditing"
            class="attack-dialog__delete-button"
            variant="text"
            :disabled="saving"
            @click="deleteAttack"
          >
            Удалить
          </v-btn>
          <v-spacer />
          <v-btn
            class="attack-dialog__save-button"
            type="submit"
            :loading="saving"
            :disabled="saving"
          >
            {{ isEditing ? 'Сохранить изменения' : 'Добавить' }}
          </v-btn>
          <v-btn variant="text" :disabled="saving" @click="closeDialog">Отмена</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.attack-dialog-card {
  max-height: 90dvh;
  overflow: hidden;
  background: var(--page-surface);
  color: var(--text-color);
}

.attack-dialog__title {
  display: flex;
  align-items: center;
  color: var(--heading-color);
  white-space: normal;
}

.attack-dialog__content {
  padding: 20px 24px;
  color: var(--text-color);
}

.attack-dialog__content :deep(.v-row) {
  margin: -3px;
}

.attack-dialog__content :deep(.v-col) {
  padding: 3px;
}

.attack-dialog-card :deep(.v-divider) {
  border-color: var(--border-color);
}

.attack-dialog-field :deep(.v-field) {
  min-height: 64px;
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
}

.attack-dialog-field :deep(.v-field__input) {
  min-height: 64px;
  padding-top: 22px;
  padding-bottom: 12px;
  color: var(--text-color);
  font-size: 1.05rem;
}

.attack-dialog-field :deep(.v-field-label) {
  transform: translateY(-4px);
  color: var(--text-muted);
}

.attack-dialog-field :deep(.v-field__outline) {
  color: var(--border-color);
}

.attack-dialog-field :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.attack-dialog-field :deep(.v-label),
.attack-dialog-field :deep(input) {
  color: var(--text-color);
  opacity: 1;
}

.attack-dialog-field :deep(input::placeholder) {
  color: var(--text-muted);
}

.attack-dialog-field :deep(input::-webkit-inner-spin-button),
.attack-dialog-field :deep(input::-webkit-outer-spin-button) {
  appearance: none;
  -webkit-appearance: none;
}

.attack-dialog__actions {
  display: flex;
  gap: 8px;
  padding: 16px;
}

.attack-dialog__save-button {
  min-width: 160px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
}

.attack-dialog__save-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.attack-dialog__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.attack-dialog__delete-button {
  color: var(--delete-text);
}

.attack-dialog__delete-button:hover:not(:disabled) {
  background: var(--delete-hover-background);
}

@media (max-width: 600px) {
  .attack-dialog__title {
    padding-inline: 16px;
    font-size: 1.05rem;
  }

  .attack-dialog__content {
    padding: 16px;
  }

  .attack-dialog__actions {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px 16px;
  }

  .attack-dialog__actions :deep(.v-spacer) {
    display: none;
  }

  .attack-dialog__delete-button {
    order: 2;
  }

  .attack-dialog__actions > :deep(.v-btn) {
    width: 100%;
    min-width: 0;
    margin: 0;
  }
}
</style>
