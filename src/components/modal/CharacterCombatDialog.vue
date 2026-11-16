<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Character } from '@/types/character'
import { updateCharacterCombat, updateCharacterHits } from '@/api/character/combat'

type CombatDialogSection = 'combat' | 'hits'

interface Props {
  modelValue: boolean
  characterId: string
  combat: Character['combat']
  section: CombatDialogSection
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  updated: [combat: Character['combat']]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (open: boolean) => emit('update:modelValue', open),
})

const form = reactive({
  armorClass: props.combat.armorClass,
  initiative: props.combat.initiative,
  speed: props.combat.speed,
  hitDice: props.combat.hitDice,
  hp: { ...props.combat.hp },
})
const fieldErrors = reactive({
  armorClass: '',
  initiative: '',
  speed: '',
  maxHp: '',
  currentHp: '',
  tempHp: '',
  hitDice: '',
})
type CombatField = keyof typeof fieldErrors
type NumericInput = number | string | null | undefined

const saving = ref(false)

const dialogTitle = computed(() =>
  props.section === 'combat' ? 'Редактирование боевых характеристик' : 'Редактирование хитов',
)

function closeDialog() {
  if (saving.value) return
  dialogOpen.value = false
}

function clearFieldError(field: CombatField) {
  fieldErrors[field] = ''
}

function isFilledNumber(value: NumericInput): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  return Number.isFinite(Number(value))
}

function validateNumbers(
  fields: Array<{ field: CombatField; value: NumericInput; message: string }>,
): boolean {
  let valid = true

  for (const { field, value, message } of fields) {
    if (!isFilledNumber(value)) {
      fieldErrors[field] = message
      valid = false
    } else {
      fieldErrors[field] = ''
    }
  }

  return valid
}

function validateCombat(): boolean {
  return validateNumbers([
    { field: 'armorClass', value: form.armorClass, message: 'Укажите КД' },
    { field: 'initiative', value: form.initiative, message: 'Укажите инициативу' },
    { field: 'speed', value: form.speed, message: 'Укажите скорость' },
  ])
}

function validateHits(): boolean {
  const tempHpValue = form.hp.temp
  const tempHpIsEmpty = String(tempHpValue ?? '').trim() === ''

  if (tempHpIsEmpty) {
    form.hp.temp = 0
    fieldErrors.tempHp = ''
  } else if (!isFilledNumber(tempHpValue)) {
    fieldErrors.tempHp = 'Укажите корректное значение временных хитов'
    return false
  } else {
    fieldErrors.tempHp = ''
  }

  const numbersValid = validateNumbers([
    { field: 'maxHp', value: form.hp.max, message: 'Укажите максимум хитов' },
    { field: 'currentHp', value: form.hp.current, message: 'Укажите текущие хиты' },
  ])

  if (form.hitDice.trim() === '') {
    fieldErrors.hitDice = 'Укажите кость хитов'
    return false
  }

  fieldErrors.hitDice = ''
  return numbersValid
}

async function saveCombat(closeAfterSave = false) {
  if (saving.value || !validateCombat()) return

  saving.value = true

  try {
    const combat = await updateCharacterCombat(props.characterId, {
      armorClass: form.armorClass,
      initiative: form.initiative,
      speed: form.speed,
    })

    form.armorClass = combat.armorClass
    form.initiative = combat.initiative
    form.speed = combat.speed
    emit('updated', combat)
    emit('saved', 'Боевые характеристики сохранены')

    if (closeAfterSave) dialogOpen.value = false
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить боевые характеристики')
  } finally {
    saving.value = false
  }
}

async function saveHits(closeAfterSave = false) {
  if (saving.value || !validateHits()) return

  saving.value = true

  try {
    const [hpResult, hitDiceResult] = await Promise.allSettled([
      updateCharacterHits(props.characterId, { ...form.hp }),
      updateCharacterCombat(props.characterId, { hitDice: form.hitDice }),
    ])

    const updatedCombat: Character['combat'] = {
      ...props.combat,
      hp: { ...props.combat.hp },
      deathSaves: { ...props.combat.deathSaves },
    }
    const failedParts: string[] = []

    if (hpResult.status === 'fulfilled') {
      Object.assign(form.hp, hpResult.value)
      updatedCombat.hp = hpResult.value
    } else {
      failedParts.push('хиты')
    }

    if (hitDiceResult.status === 'fulfilled') {
      form.hitDice = hitDiceResult.value.hitDice
      updatedCombat.hitDice = hitDiceResult.value.hitDice
    } else {
      failedParts.push('кость хитов')
    }

    if (failedParts.length < 2) {
      emit('updated', updatedCombat)
    }

    if (failedParts.length > 0) {
      emit('error', `Не удалось сохранить: ${failedParts.join(', ')}`)
      return
    }

    emit('saved', 'Хиты сохранены')
    if (closeAfterSave) dialogOpen.value = false
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить хиты')
  } finally {
    saving.value = false
  }
}

function save(closeAfterSave = false) {
  if (props.section === 'combat') {
    return saveCombat(closeAfterSave)
  }

  return saveHits(closeAfterSave)
}
</script>

<template>
  <v-dialog
    v-model="dialogOpen"
    :persistent="saving"
    width="700"
    max-width="calc(100vw - 32px)"
    scrollable
  >
    <v-card class="combat-dialog-card">
      <v-card-title class="combat-dialog__title">
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

      <v-card-text class="combat-dialog__content">
        <v-row v-if="props.section === 'combat'">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.armorClass"
              class="combat-dialog-field"
              label="КД"
              type="number"
              min="0"
              max="50"
              density="comfortable"
              required
              :error-messages="fieldErrors.armorClass"
              :disabled="saving"
              @update:model-value="clearFieldError('armorClass')"
              @keydown.enter.prevent="save()"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.initiative"
              class="combat-dialog-field"
              label="Инициатива"
              type="number"
              min="-50"
              max="50"
              density="comfortable"
              required
              :error-messages="fieldErrors.initiative"
              :disabled="saving"
              @update:model-value="clearFieldError('initiative')"
              @keydown.enter.prevent="save()"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="form.speed"
              class="combat-dialog-field"
              label="Скорость"
              type="number"
              min="0"
              max="200"
              density="comfortable"
              required
              :error-messages="fieldErrors.speed"
              :disabled="saving"
              @update:model-value="clearFieldError('speed')"
              @keydown.enter.prevent="save()"
            />
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.hp.max"
              class="combat-dialog-field"
              label="Максимум хитов"
              type="number"
              min="0"
              max="9999"
              density="comfortable"
              required
              :error-messages="fieldErrors.maxHp"
              :disabled="saving"
              @update:model-value="clearFieldError('maxHp')"
              @keydown.enter.prevent="save()"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.hp.current"
              class="combat-dialog-field"
              label="Текущие хиты"
              type="number"
              min="0"
              max="9999"
              density="comfortable"
              required
              :error-messages="fieldErrors.currentHp"
              :disabled="saving"
              @update:model-value="clearFieldError('currentHp')"
              @keydown.enter.prevent="save()"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.hp.temp"
              class="combat-dialog-field"
              label="Временные хиты"
              type="number"
              min="0"
              max="9999"
              density="comfortable"
              :error-messages="fieldErrors.tempHp"
              :disabled="saving"
              @update:model-value="clearFieldError('tempHp')"
              @keydown.enter.prevent="save()"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.hitDice"
              class="combat-dialog-field"
              label="Кость хитов"
              placeholder="1d8"
              density="comfortable"
              required
              :error-messages="fieldErrors.hitDice"
              :disabled="saving"
              @update:model-value="clearFieldError('hitDice')"
              @keydown.enter.prevent="save()"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="combat-dialog__actions">
        <v-spacer />
        <v-btn
          class="combat-dialog__save-button"
          :loading="saving"
          :disabled="saving"
          @click="save(true)"
        >
          Сохранить изменения
        </v-btn>
        <v-btn variant="text" :disabled="saving" @click="closeDialog">Отмена</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.combat-dialog-card {
  max-height: 90vh;
  overflow: hidden;
  background: var(--page-surface);
  color: var(--text-color);
}

.combat-dialog__title {
  display: flex;
  align-items: center;
  color: var(--heading-color);
  white-space: normal;
}

.combat-dialog__content {
  padding: 20px 24px;
  color: var(--text-color);
}

.combat-dialog__content :deep(.v-row) {
  margin: -3px;
}

.combat-dialog__content :deep(.v-col) {
  padding: 3px;
}

.combat-dialog-card :deep(.v-divider) {
  border-color: var(--border-color);
}

.combat-dialog-field :deep(.v-field) {
  min-height: 64px;
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
}

.combat-dialog-field :deep(.v-field__input) {
  min-height: 64px;
  padding-top: 22px;
  padding-bottom: 12px;
  color: var(--text-color);
  font-size: 1.05rem;
}

.combat-dialog-field :deep(input::-webkit-inner-spin-button),
.combat-dialog-field :deep(input::-webkit-outer-spin-button) {
  appearance: none;
  -webkit-appearance: none;
}

.combat-dialog-field :deep(.v-field-label) {
  transform: translateY(-4px);
  color: var(--text-muted);
}

.combat-dialog-field :deep(.v-field__outline) {
  color: var(--border-color);
}

.combat-dialog-field :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.combat-dialog-field :deep(.v-label),
.combat-dialog-field :deep(input),
.combat-dialog-field :deep(textarea) {
  color: var(--text-color);
  opacity: 1;
}

.combat-dialog__save-button {
  min-width: 200px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
}

.combat-dialog__save-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.combat-dialog__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.combat-dialog__save-button:disabled {
  opacity: 0.6;
}

.combat-dialog__actions {
  padding: 16px;
}

@media (max-width: 600px) {
  .combat-dialog-card {
    max-height: 90dvh;
  }

  .combat-dialog__title {
    padding-inline: 16px;
    font-size: 1.05rem;
  }

  .combat-dialog__content {
    padding: 16px;
  }

  .combat-dialog__save-button {
    width: 100%;
    min-width: 0;
  }

  .combat-dialog__actions {
    flex-wrap: wrap;
    padding: 12px 16px;
  }
}
</style>
