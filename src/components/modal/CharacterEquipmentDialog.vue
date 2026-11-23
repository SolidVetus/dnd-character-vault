<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { CharacterCurrency } from '@/api/character/equipment'
import {
  createEquipmentItem,
  updateCharacterCurrency,
  updateEquipmentItem,
  type EquipmentItemCreate,
} from '@/api/character/equipment'
import type { EquipmentItem } from '@/types/character'

const currencyFields = [
  { key: 'cp', label: 'Медные (ММ)' },
  { key: 'sp', label: 'Серебряные (СМ)' },
  { key: 'ep', label: 'Электрум (ЭМ)' },
  { key: 'gp', label: 'Золотые (ЗМ)' },
  { key: 'pp', label: 'Платиновые (ПМ)' },
] as const satisfies { key: keyof CharacterCurrency; label: string }[]

interface Props {
  modelValue: boolean
  characterId: string
  mode: 'currency' | 'item'
  currency: CharacterCurrency
  item: EquipmentItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  'currency-updated': [currency: CharacterCurrency]
  'item-created': [item: EquipmentItem]
  'item-updated': [item: EquipmentItem]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (open: boolean) => emit('update:modelValue', open),
})

const isEditing = computed(() => props.mode === 'item' && props.item !== null)
const dialogTitle = computed(() => {
  if (props.mode === 'currency') return 'Валюта персонажа'
  return isEditing.value ? 'Редактировать предмет' : 'Добавить предмет'
})
const saveButtonLabel = computed(() => {
  if (props.mode === 'currency') return 'Сохранить валюту'
  return isEditing.value ? 'Сохранить изменения' : 'Добавить предмет'
})

const currencyValues = reactive<Record<keyof CharacterCurrency, string>>({
  cp: String(props.currency.cp),
  sp: String(props.currency.sp),
  ep: String(props.currency.ep),
  gp: String(props.currency.gp),
  pp: String(props.currency.pp),
})
const currencyErrors = reactive<Record<keyof CharacterCurrency, string>>({
  cp: '',
  sp: '',
  ep: '',
  gp: '',
  pp: '',
})
const itemForm = reactive({
  name: props.item?.name ?? '',
  quantity: String(props.item?.quantity ?? 1),
  note: props.item?.note ?? '',
})
const itemNameError = ref('')
const itemQuantityError = ref('')
const saving = ref(false)

watch(
  () => props.currency,
  (currency) => {
    for (const field of currencyFields) {
      currencyValues[field.key] = String(currency[field.key])
    }
  },
  { deep: true },
)

watch(
  () => props.item,
  (item) => {
    if (props.mode !== 'item' || !item) return
    Object.assign(itemForm, {
      name: item.name,
      quantity: String(item.quantity),
      note: item.note ?? '',
    })
  },
  { deep: true },
)

function updateCurrencyValue(key: keyof CharacterCurrency, value: unknown) {
  currencyErrors[key] = ''
  currencyValues[key] = value === null ? '' : String(value)
}

function updateItemQuantity(value: unknown) {
  itemQuantityError.value = ''
  itemForm.quantity = value === null ? '' : String(value)
}

function updateItemName(value: unknown) {
  itemNameError.value = ''
  itemForm.name = value === null ? '' : String(value)
}

function updateItemNote(value: unknown) {
  itemForm.note = value === null ? '' : String(value)
}

function validateCurrency(): boolean {
  let valid = true

  for (const field of currencyFields) {
    const rawValue = currencyValues[field.key].trim()
    const value = rawValue === '' ? 0 : Number(rawValue)

    if (!Number.isInteger(value) || value < 0 || value > 999) {
      currencyErrors[field.key] = 'Введите целое число от 0 до 999'
      valid = false
    } else {
      currencyErrors[field.key] = ''
    }
  }

  return valid
}

function getCurrencyValues(): CharacterCurrency {
  return {
    cp: Number(currencyValues.cp) || 0,
    sp: Number(currencyValues.sp) || 0,
    ep: Number(currencyValues.ep) || 0,
    gp: Number(currencyValues.gp) || 0,
    pp: Number(currencyValues.pp) || 0,
  }
}

function validateItem(): boolean {
  let valid = true
  const quantity = Number(itemForm.quantity)

  if (!itemForm.name.trim()) {
    itemNameError.value = 'Укажите название предмета'
    valid = false
  } else {
    itemNameError.value = ''
  }

  if (
    itemForm.quantity.trim() === '' ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 9999
  ) {
    itemQuantityError.value = 'Введите целое число от 1 до 9999'
    valid = false
  } else {
    itemQuantityError.value = ''
  }

  return valid
}

async function saveCurrency(closeAfterSave: boolean) {
  if (!validateCurrency()) return

  const updatedCurrency = await updateCharacterCurrency(props.characterId, getCurrencyValues())
  for (const field of currencyFields) {
    currencyValues[field.key] = String(updatedCurrency[field.key])
  }
  emit('currency-updated', updatedCurrency)
  emit('saved', 'Валюта сохранена')
  if (closeAfterSave) dialogOpen.value = false
}

async function saveItem(closeAfterSave: boolean) {
  if (!validateItem()) return

  const values: EquipmentItemCreate = {
    name: itemForm.name.trim(),
    quantity: Number(itemForm.quantity),
    note: itemForm.note.trim() || null,
  }
  const item = props.item
    ? await updateEquipmentItem(props.characterId, props.item.id, values)
    : await createEquipmentItem(props.characterId, values)

  if (isEditing.value) {
    emit('item-updated', item)
    emit('saved', `Предмет «${item.name}» сохранён`)
  } else {
    emit('item-created', item)
    emit('saved', `Предмет «${item.name}» добавлен`)
    if (!closeAfterSave) {
      Object.assign(itemForm, { name: '', quantity: '1', note: '' })
    }
  }

  if (closeAfterSave) dialogOpen.value = false
}

async function save(closeAfterSave = false) {
  if (saving.value) return
  saving.value = true

  try {
    if (props.mode === 'currency') {
      await saveCurrency(closeAfterSave)
    } else {
      await saveItem(closeAfterSave)
    }
  } catch (err) {
    const fallbackMessage =
      props.mode === 'currency'
        ? 'Не удалось сохранить валюту'
        : isEditing.value
          ? 'Не удалось сохранить предмет'
          : 'Не удалось добавить предмет'
    emit('error', err instanceof Error ? err.message : fallbackMessage)
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  if (saving.value) return
  dialogOpen.value = false
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
    <v-card class="equipment-dialog-card">
      <v-card-title class="equipment-dialog__title">
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

      <v-form class="equipment-dialog__form" @submit.prevent="save(true)">
        <v-card-text class="equipment-dialog__content">
          <div v-if="mode === 'currency'" class="equipment-dialog__currency-fields">
            <v-text-field
              v-for="field in currencyFields"
              :key="field.key"
              class="equipment-dialog-field"
              :model-value="currencyValues[field.key]"
              :label="field.label"
              type="number"
              min="0"
              max="999999"
              step="1"
              required
              clearable
              :error-messages="currencyErrors[field.key]"
              :disabled="saving"
              @update:model-value="updateCurrencyValue(field.key, $event)"
              @keydown.enter.prevent="save()"
            />
          </div>

          <template v-else>
            <div class="equipment-dialog__item-fields">
              <v-text-field
                :model-value="itemForm.name"
                class="equipment-dialog-field"
                label="Название предмета"
                maxlength="200"
                required
                clearable
                :error-messages="itemNameError"
                :disabled="saving"
                @update:model-value="updateItemName"
                @keydown.enter.prevent="save()"
              />

              <v-text-field
                :model-value="itemForm.quantity"
                class="equipment-dialog-field"
                label="Количество"
                type="number"
                min="1"
                max="9999"
                step="1"
                required
                clearable
                :error-messages="itemQuantityError"
                :disabled="saving"
                @update:model-value="updateItemQuantity"
                @keydown.enter.prevent="save()"
              />
            </div>

            <v-textarea
              :model-value="itemForm.note"
              class="equipment-dialog-field"
              label="Заметка"
              maxlength="2000"
              rows="3"
              auto-grow
              clearable
              :disabled="saving"
              @update:model-value="updateItemNote"
            />
          </template>
        </v-card-text>

        <v-divider />
        <v-card-actions class="equipment-dialog__actions">
          <v-spacer />
          <v-btn
            class="equipment-dialog__save-button"
            type="submit"
            :loading="saving"
            :disabled="saving"
          >
            {{ saveButtonLabel }}
          </v-btn>
          <v-btn variant="text" :disabled="saving" @click="closeDialog">Отмена</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.equipment-dialog-card {
  max-height: 90dvh;
  overflow: hidden;
  background: var(--page-surface);
  color: var(--text-color);
}

.equipment-dialog__title {
  display: flex;
  align-items: center;
  color: var(--heading-color);
  white-space: normal;
}

.equipment-dialog__content {
  display: grid;
  gap: 8px;
  padding: 20px 24px;
  color: var(--text-color);
}

.equipment-dialog__content :deep(.v-input) {
  min-width: 0;
}

.equipment-dialog__currency-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.equipment-dialog__item-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px;
  gap: 8px;
}

.equipment-dialog-card :deep(.v-divider) {
  border-color: var(--border-color);
}

.equipment-dialog-field :deep(.v-field) {
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
}

.equipment-dialog-field :deep(.v-field__outline) {
  color: var(--border-color);
}

.equipment-dialog-field :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.equipment-dialog-field :deep(.v-field__input),
.equipment-dialog-field :deep(input),
.equipment-dialog-field :deep(textarea),
.equipment-dialog-field :deep(.v-label) {
  color: var(--text-color);
  opacity: 1;
}

.equipment-dialog-field :deep(textarea) {
  line-height: 1.5;
}

.equipment-dialog-field :deep(input[type='number']) {
  appearance: textfield;
  -moz-appearance: textfield;
}

.equipment-dialog-field :deep(input::-webkit-inner-spin-button),
.equipment-dialog-field :deep(input::-webkit-outer-spin-button) {
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
}

.equipment-dialog__actions {
  display: flex;
  gap: 8px;
  padding: 16px;
}

.equipment-dialog__save-button {
  min-width: 160px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
}

.equipment-dialog__save-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.equipment-dialog__save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .equipment-dialog__title {
    padding-inline: 16px;
    font-size: 1.05rem;
  }

  .equipment-dialog__content {
    padding: 16px;
  }

  .equipment-dialog__currency-fields {
    grid-template-columns: minmax(0, 1fr);
  }

  .equipment-dialog__actions {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px 16px;
  }

  .equipment-dialog__actions :deep(.v-spacer) {
    display: none;
  }

  .equipment-dialog__actions :deep(.v-btn) {
    width: 100%;
    min-width: 0;
    margin: 0;
  }
}

@media (max-width: 380px) {
  .equipment-dialog__item-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
