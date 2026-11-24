<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import type { Character, EquipmentItem } from '@/types/character'
import { deleteEquipmentItem, type CharacterCurrency } from '@/api/character/equipment'
import CharacterEquipmentDialog from './modal/CharacterEquipmentDialog.vue'

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

const dialogOpen = ref(false)
const dialogMode = ref<'currency' | 'item'>('item')
const activeItemId = ref<string | null>(null)
const deletingItemId = ref<string | null>(null)
const { width } = useDisplay()

const activeItem = computed(
  () => items.value.find((item) => item.id === activeItemId.value) ?? null,
)
const currencyFields = [
  { key: 'cp', label: 'ММ' },
  { key: 'sp', label: 'СМ' },
  { key: 'ep', label: 'ЭМ' },
  { key: 'gp', label: 'ЗМ' },
  { key: 'pp', label: 'ПМ' },
] as const satisfies { key: keyof CharacterCurrency; label: string }[]

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

function handleCurrencyUpdated(updatedCurrency: CharacterCurrency) {
  currency.value = { ...updatedCurrency }
  emitEquipmentUpdated()
}

function handleEditCurrency() {
  dialogMode.value = 'currency'
  activeItemId.value = null
  dialogOpen.value = true
}

function handleAddItem() {
  dialogMode.value = 'item'
  activeItemId.value = null
  dialogOpen.value = true
}

function handleEditItem(item: EquipmentItem) {
  dialogMode.value = 'item'
  activeItemId.value = item.id
  dialogOpen.value = true
}

function handleItemCreated(item: EquipmentItem) {
  items.value.push(item)
  emitEquipmentUpdated()
}

function handleItemUpdated(updatedItem: EquipmentItem) {
  items.value = items.value.map((item) => (item.id === updatedItem.id ? updatedItem : item))
  emitEquipmentUpdated()
}

async function handleDeleteItem(itemId: string) {
  if (deletingItemId.value) return

  const itemIndex = items.value.findIndex((item) => item.id === itemId)
  const removedItem = items.value[itemIndex]
  if (itemIndex === -1 || !removedItem) return

  items.value.splice(itemIndex, 1)
  deletingItemId.value = itemId

  try {
    await deleteEquipmentItem(props.characterId, itemId)
    emitEquipmentUpdated()
    emit('saved', 'Изменения сохранены')
  } catch {
    items.value.splice(itemIndex, 0, removedItem)
    emit('error', 'Не удалось удалить предмет')
  } finally {
    deletingItemId.value = null
  }
}
</script>

<template>
  <section class="equipment">
    <h2 class="equipment__title">Снаряжение</h2>
    <div class="equipment__items">
      <section class="equipment__currency-section" aria-labelledby="currency-title">
        <div class="equipment__section-heading">
          <h3 id="currency-title">Валюта</h3>
          <v-tooltip
            :text="`Редактировать колличество валюты`"
            location="bottom"
            :disabled="width <= 760"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                class="equipment__currency-edit"
                type="button"
                @click="handleEditCurrency"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>
              </button>
            </template>
          </v-tooltip>
        </div>

        <div class="equipment__currency">
          <div v-for="field in currencyFields" :key="field.key" class="equipment__coin">
            <span>{{ field.label }}</span>
            <strong>{{ currency[field.key] }}</strong>
          </div>
        </div>
      </section>

      <section class="equipment__gear-section" aria-labelledby="gear-title">
        <h3 id="gear-title">Предметы</h3>

        <div v-if="items.length" class="equipment__list">
          <article v-for="item in items" :key="item.id" class="equipment__item">
            <div class="equipment__item-details">
              <h4>{{ item.name }}</h4>
              <p v-if="item.note">{{ item.note }}</p>
            </div>

            <span class="equipment__quantity" :aria-label="`Количество: ${item.quantity}`">
              × {{ item.quantity }}
            </span>

            <div class="equipment__item-actions">
              <v-tooltip
                :text="`Редактировать предмет: ${item.name}`"
                location="bottom"
                :disabled="width <= 760"
              >
                <template #activator="{ props }">
                  <button
                    v-bind="props"
                    class="equipment__icon-button"
                    type="button"
                    :disabled="deletingItemId !== null"
                    :aria-label="`Редактировать предмет ${item.name}`"
                    title="Редактировать"
                    @click="handleEditItem(item)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>

              <v-tooltip
                :text="`Удалить предмет: ${item.name}`"
                location="bottom"
                :disabled="width <= 760"
              >
                <template #activator="{ props }">
                  <button
                    v-bind="props"
                    class="equipment__icon-button"
                    type="button"
                    :disabled="deletingItemId !== null"
                    :aria-label="`Удалить предмет ${item.name}`"
                    title="Удалить"
                    @click="handleDeleteItem(item.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </article>
        </div>
        <p v-else class="equipment__empty">Снаряжение пока не добавлено.</p>

        <button class="equipment__add-button" type="button" @click="handleAddItem">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Добавить предмет
        </button>
      </section>
    </div>

    <CharacterEquipmentDialog
      v-if="dialogOpen"
      :key="dialogMode === 'currency' ? 'currency' : (activeItemId ?? 'new-equipment-item')"
      v-model="dialogOpen"
      :character-id="props.characterId"
      :mode="dialogMode"
      :currency="currency"
      :item="activeItem"
      @currency-updated="handleCurrencyUpdated"
      @item-created="handleItemCreated"
      @item-updated="handleItemUpdated"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.equipment {
  display: grid;
  gap: 1rem;
  color: var(--text-color);
}

.equipment__title {
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--accent-color);
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.equipment__currency {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.equipment__items {
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
}

.equipment__currency-section,
.equipment__gear-section {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.equipment__currency-section {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.equipment__section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.equipment__section-heading h3,
.equipment__gear-section > h3 {
  min-width: 0;
  margin: 0;
  color: var(--heading-color);
  font-size: 1rem;
  font-weight: 700;
}

.equipment__coin {
  display: grid;
  justify-items: center;
  gap: 4px;
  min-width: 0;
  padding: 10px 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--page-background);
}

.equipment__coin span {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
}

.equipment__coin strong {
  color: var(--text-color);
  font-size: 1.1rem;
  font-weight: 700;
}

.equipment__currency-edit,
.equipment__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--page-background);
  color: var(--accent-color);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.equipment__currency-edit svg,
.equipment__icon-button svg,
.equipment__add-button svg {
  display: block;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.equipment__currency-edit:hover:not(:disabled),
.equipment__icon-button:hover:not(:disabled) {
  border-color: var(--card-hover-border);
  background: var(--page-surface);
  color: var(--button-hover-border);
}

.equipment__currency-edit:focus-visible,
.equipment__icon-button:focus-visible,
.equipment__add-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.equipment__list {
  display: grid;
  gap: 8px;
}

.equipment__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--page-background);
}

.equipment__item-details {
  min-width: 0;
}

.equipment__item-details h4 {
  margin: 0;
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.equipment__item-details p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.equipment__quantity {
  min-width: 48px;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--page-surface);
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.equipment__item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.equipment__icon-button {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  padding: 7px;
  border-color: transparent;
  background: transparent;
}

.equipment__icon-button:disabled,
.equipment__currency-edit:disabled,
.equipment__add-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.equipment__add-button {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 8px;
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  color: var(--button-text);
  background: var(--button-background);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.equipment__add-button:hover:not(:disabled) {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background);
}

.equipment__empty {
  margin: 0;
  color: var(--text-muted);
}

@media (max-width: 700px) {
  .equipment__currency {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .equipment__items {
    padding: 12px;
  }

  .equipment__currency {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .equipment__item {
    gap: 5px;
    padding: 8px;
  }

  .equipment__quantity {
    min-width: 42px;
    padding-inline: 5px;
  }

  .equipment__icon-button {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }
}
</style>
