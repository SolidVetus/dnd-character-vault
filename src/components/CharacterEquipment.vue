<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  createEquipmentItem,
  deleteEquipmentItem,
  updateCharacterCurrency,
  updateEquipmentItem,
  type Character,
  type EquipmentItem,
} from '../api/characters'

const props = defineProps<{
  characterId: string
  equipment: Character['equipment']
}>()

const emit = defineEmits<{
  updated: [equipment: Character['equipment']]
  saved: [message: string]
  error: [message: string]
}>()

const currency = ref({ ...props.equipment.currency })
const items = ref<EquipmentItem[]>(props.equipment.items.map((item) => ({ ...item })))

const newItemName = ref('')
const newItemQuantity = ref(1)
const newItemNote = ref('')
const isAdding = ref(false)
const isAddFormVisible = ref(false)

watch(
  () => props.equipment,
  (equipment) => {
    currency.value = { ...equipment.currency }
    items.value = equipment.items.map((item) => ({ ...item }))
  },
  { deep: true },
)

function emitEquipmentUpdated() {
  emit('updated', {
    currency: { ...currency.value },
    items: items.value.map((item) => ({ ...item })),
  })
}

function handleShowAddForm() {
  isAddFormVisible.value = true
}

function handleCancelAddForm() {
  isAddFormVisible.value = false
  newItemName.value = ''
  newItemQuantity.value = 1
  newItemNote.value = ''
}

async function handleCurrencyChange(key: keyof Character['equipment']['currency'], event: Event) {
  const input = event.target as HTMLInputElement
  const value = Number(input.value)

  if (!Number.isInteger(value) || value < 0 || value > 999999) {
    input.value = String(currency.value[key])
    return
  }

  const previousValue = currency.value[key]
  currency.value[key] = value

  try {
    const updatedCurrency = await updateCharacterCurrency(props.characterId, {
      [key]: value,
    })

    currency.value = { ...updatedCurrency }
    emitEquipmentUpdated()
    emit('saved', 'Изменения сохранены.')
  } catch {
    currency.value[key] = previousValue
    input.value = String(previousValue)
    emit('error', 'Не удалось сохранить валюту')
  }
}

async function handleAddItem() {
  const name = newItemName.value.trim()

  if (!name || isAdding.value) return

  if (
    !Number.isInteger(newItemQuantity.value) ||
    newItemQuantity.value < 1 ||
    newItemQuantity.value > 9999
  ) {
    emit('error', 'Количество предмета должно быть от 1 до 9999')
    return
  }

  isAdding.value = true

  try {
    const item = await createEquipmentItem(props.characterId, {
      name,
      quantity: newItemQuantity.value,
      note: newItemNote.value.trim() || null,
    })

    items.value.push(item)
    newItemName.value = ''
    newItemQuantity.value = 1
    newItemNote.value = ''
    isAddFormVisible.value = false

    emitEquipmentUpdated()
    emit('saved', 'Изменения сохранены.')
  } catch {
    emit('error', 'Не удалось добавить предмет')
  } finally {
    isAdding.value = false
  }
}

async function handleItemFieldChange(
  item: EquipmentItem,
  field: 'name' | 'quantity' | 'note',
  event: Event,
) {
  const input = event.target as HTMLInputElement | HTMLTextAreaElement
  const itemIndex = items.value.findIndex((current) => current.id === item.id)

  if (itemIndex === -1) return

  const currentItem = items.value[itemIndex]
  if (!currentItem) return

  const previousItem = { ...currentItem }

  let value: string | number | null

  if (field === 'quantity') {
    value = Number(input.value)

    if (!Number.isInteger(value) || value < 1 || value > 9999) {
      input.value = String(previousItem.quantity)
      return
    }
  } else {
    value = input.value.trim()

    if (field === 'name' && !value) {
      input.value = previousItem.name
      return
    }

    if (field === 'note' && value === '') {
      value = null
    }
  }

  if (previousItem[field] === value) return

  Object.assign(currentItem, { [field]: value })

  try {
    const updatedItem = await updateEquipmentItem(props.characterId, item.id, { [field]: value })

    items.value[itemIndex] = updatedItem
    emitEquipmentUpdated()
    emit('saved', 'Изменения сохранены.')
  } catch {
    items.value[itemIndex] = previousItem
    input.value = String(previousItem[field] ?? '')
    emit('error', 'Не удалось сохранить предмет')
  }
}

async function handleDeleteItem(itemId: string) {
  const itemIndex = items.value.findIndex((item) => item.id === itemId)

  if (itemIndex === -1) return

  const removedItem = items.value[itemIndex]
  if (!removedItem) return

  items.value.splice(itemIndex, 1)

  try {
    await deleteEquipmentItem(props.characterId, itemId)
    emitEquipmentUpdated()
    emit('saved', 'Изменения сохранены.')
  } catch {
    items.value.splice(itemIndex, 0, removedItem)
    emit('error', 'Не удалось удалить предмет')
  }
}
</script>

<template>
  <section class="equipment">
    <h2 class="equipment__title">Снаряжение</h2>

    <div class="equipment__currency">
      <label class="equipment__currency-field">
        <span>ММ</span>
        <input
          type="number"
          min="0"
          max="999999"
          :value="currency.cp"
          @change="handleCurrencyChange('cp', $event)"
        />
      </label>

      <label class="equipment__currency-field">
        <span>СМ</span>
        <input
          type="number"
          min="0"
          max="999999"
          :value="currency.sp"
          @change="handleCurrencyChange('sp', $event)"
        />
      </label>

      <label class="equipment__currency-field">
        <span>ЭМ</span>
        <input
          type="number"
          min="0"
          max="999999"
          :value="currency.ep"
          @change="handleCurrencyChange('ep', $event)"
        />
      </label>

      <label class="equipment__currency-field">
        <span>ЗМ</span>
        <input
          type="number"
          min="0"
          max="999999"
          :value="currency.gp"
          @change="handleCurrencyChange('gp', $event)"
        />
      </label>

      <label class="equipment__currency-field">
        <span>ПМ</span>
        <input
          type="number"
          min="0"
          max="999999"
          :value="currency.pp"
          @change="handleCurrencyChange('pp', $event)"
        />
      </label>
    </div>

    <div class="equipment__items">
      <h3 class="equipment__subtitle">Предметы</h3>

      <div v-if="items.length" class="equipment__list">
        <article v-for="item in items" :key="item.id" class="equipment__item">
          <input
            class="equipment__item-name"
            type="text"
            maxlength="200"
            aria-label="Название предмета"
            :value="item.name"
            @change="handleItemFieldChange(item, 'name', $event)"
          />

          <input
            class="equipment__quantity"
            type="number"
            min="1"
            max="9999"
            :value="item.quantity"
            aria-label="Количество предмета"
            title="Количество"
            @change="handleItemFieldChange(item, 'quantity', $event)"
          />

          <input
            class="equipment__item-note"
            type="text"
            maxlength="1000"
            aria-label="Примечание к предмету"
            placeholder="Примечание"
            :value="item.note ?? ''"
            @change="handleItemFieldChange(item, 'note', $event)"
          />

          <button
            class="equipment__delete icon-button delete-button"
            type="button"
            aria-label="Удалить предмет"
            title="Удалить предмет"
            @click="handleDeleteItem(item.id)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
            </svg>
          </button>
        </article>
      </div>

      <p v-else class="equipment__empty">Снаряжение пока не добавлено.</p>

      <button
        v-if="!isAddFormVisible"
        class="equipment__add-button"
        type="button"
        @click="handleShowAddForm"
      >
        + Добавить предмет
      </button>

      <form v-else class="equipment__add-form" @submit.prevent="handleAddItem">
        <input
          v-model="newItemName"
          type="text"
          maxlength="200"
          placeholder="Название предмета"
          aria-label="Название нового предмета"
          required
          autofocus
        />

        <input
          v-model.number="newItemQuantity"
          type="number"
          min="1"
          max="9999"
          aria-label="Количество нового предмета"
          required
        />

        <input
          v-model="newItemNote"
          type="text"
          maxlength="1000"
          placeholder="Примечание"
          aria-label="Примечание к новому предмету"
        />

        <div class="equipment__add-actions">
          <button class="equipment__add-button" type="submit" :disabled="isAdding">
            {{ isAdding ? 'Добавление…' : 'Добавить' }}
          </button>

          <button
            class="equipment__cancel-button"
            type="button"
            :disabled="isAdding"
            @click="handleCancelAddForm"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.equipment {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.equipment__title,
.equipment__subtitle {
  margin: 0;
}

.equipment__title {
  font-size: 1.25rem;
}

.equipment__subtitle {
  margin-bottom: 12px;
  font-size: 1rem;
}

.equipment__currency {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.equipment__currency-field,
.equipment__quantity {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.equipment__currency-field span,
.equipment__quantity span {
  font-size: 0.85rem;
}

.equipment input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 8px;
}

.equipment__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.equipment__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.equipment__item {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 90px minmax(120px, 1fr) auto;
  align-items: end;
  gap: 10px;
}

.equipment__item-name,
.equipment__item-note {
  align-self: end;
}

.equipment__delete {
  padding: 8px 12px;
  cursor: pointer;
}

.equipment__add-form {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 90px minmax(120px, 1fr);
  gap: 10px;
}

.equipment__add-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.equipment__add-button,
.equipment__cancel-button {
  justify-self: start;
  padding: 8px 12px;
  cursor: pointer;
}

.equipment__add-button:disabled,
.equipment__cancel-button:disabled {
  cursor: wait;
}

.equipment__cancel-button {
  border: 1px solid #ccc;
  border-radius: 4px;
  background: transparent;
}

.equipment__add-form button {
  padding: 8px 12px;
  cursor: pointer;
}

.equipment__add-form button:disabled {
  cursor: wait;
}

.equipment__empty {
  margin: 0;
  opacity: 0.7;
}

@media (max-width: 700px) {
  .equipment__currency {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .equipment__item,
  .equipment__add-form {
    grid-template-columns: 1fr 90px;
  }

  .equipment__item-note,
  .equipment__add-form input:nth-of-type(3) {
    grid-column: 1 / -1;
  }
}

.equipment__delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #c62828;
  background: transparent;
  cursor: pointer;
}

.equipment__delete svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.equipment__delete:hover {
  background: #ffebee;
}
</style>
