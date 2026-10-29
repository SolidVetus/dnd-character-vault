<script setup lang="ts">
import { ref } from 'vue'
import type { CharacterAttack } from '@/types/character'
import {
  createCharacterAttack,
  updateCharacterAttack,
  deleteCharacterAttack,
} from '@/api/character/attacks'

const props = defineProps<{
  characterId: string
  attacks: CharacterAttack[]
}>()

const emit = defineEmits<{
  'update:attacks': [attacks: CharacterAttack[]]
}>()

const newAttackName = ref('')
const newAttackBonus = ref<number | null>(null)
const newAttackDamage = ref('')

const isAdding = ref(false)
const isAddFormVisible = ref(false)
const errorMessage = ref('')

function handleShowAddForm() {
  errorMessage.value = ''
  isAddFormVisible.value = true
}

function handleCancelAddForm() {
  isAddFormVisible.value = false
  newAttackName.value = ''
  newAttackBonus.value = null
  newAttackDamage.value = ''
  errorMessage.value = ''
}

function updateAttackDraft(
  attackId: string,
  field: 'name' | 'attackBonus' | 'damage',
  value: string | number | null,
) {
  const attack = props.attacks.find((item) => item.id === attackId)

  if (!attack) return

  const updatedAttack = {
    ...attack,
    [field]: value,
  }

  emit(
    'update:attacks',
    props.attacks.map((item) => (item.id === attackId ? updatedAttack : item)),
  )
}

async function handleAddAttack() {
  const name = newAttackName.value.trim()
  const bonus = newAttackBonus.value
  const damage = newAttackDamage.value.trim()

  if (isAdding.value) return

  if (!name || !damage || !bonus) {
    errorMessage.value = 'Заполни все поля.'
    return
  }

  isAdding.value = true
  errorMessage.value = ''

  try {
    const createdAttack = await createCharacterAttack(props.characterId, {
      name,
      attackBonus: newAttackBonus.value,
      damage,
      note: null,
    })

    emit('update:attacks', [...props.attacks, createdAttack])
    handleCancelAddForm()
  } catch {
    errorMessage.value = 'Не удалось сохранить атаку.'
  } finally {
    isAdding.value = false
  }
}

async function saveEditedAttack(attackId: string) {
  const attack = props.attacks.find((item) => item.id === attackId)

  if (!attack) return

  if (!attack.name.trim() || !attack.damage.trim()) {
    errorMessage.value = 'Название и урон не должны быть пустыми.'
    return
  }

  errorMessage.value = ''

  try {
    const updatedAttack = await updateCharacterAttack(props.characterId, attack.id, {
      name: attack.name.trim(),
      attackBonus: attack.attackBonus,
      damage: attack.damage.trim(),
    })

    emit(
      'update:attacks',
      props.attacks.map((item) => (item.id === updatedAttack.id ? updatedAttack : item)),
    )
  } catch {
    errorMessage.value = 'Не удалось сохранить изменения атаки.'
  }
}

async function removeAttack(attack: CharacterAttack) {
  if (!window.confirm(`Удалить атаку «${attack.name}»?`)) return

  errorMessage.value = ''

  try {
    await deleteCharacterAttack(props.characterId, attack.id)

    emit(
      'update:attacks',
      props.attacks.filter((item) => item.id !== attack.id),
    )
  } catch {
    errorMessage.value = 'Не удалось удалить атаку.'
  }
}
</script>

<template>
  <section>
    <h2 class="section-header">Атаки и заклинания</h2>

    <v-card class="attacks-section" variant="outlined">
      <v-card-text>
        <div class="attacks-table">
          <div class="table-header">
            <span>Название</span>
            <span>Бонус атаки</span>
            <span>Урон/вид</span>
            <span></span>
          </div>

          <div v-for="attack in attacks" :key="attack.id" class="attack-row">
            <input
              :value="attack.name"
              type="text"
              maxlength="200"
              aria-label="Название атаки"
              @input="
                updateAttackDraft(attack.id, 'name', ($event.target as HTMLInputElement).value)
              "
              @change="saveEditedAttack(attack.id)"
            />

            <input
              :value="attack.attackBonus ?? ''"
              type="number"
              min="-99"
              max="99"
              aria-label="Бонус атаки"
              @input="
                updateAttackDraft(
                  attack.id,
                  'attackBonus',
                  ($event.target as HTMLInputElement).value === ''
                    ? null
                    : Number(($event.target as HTMLInputElement).value),
                )
              "
              @change="saveEditedAttack(attack.id)"
            />

            <input
              :value="attack.damage"
              type="text"
              maxlength="200"
              aria-label="Урон и вид атаки"
              @input="
                updateAttackDraft(attack.id, 'damage', ($event.target as HTMLInputElement).value)
              "
              @change="saveEditedAttack(attack.id)"
            />

            <div class="row-actions">
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                :aria-label="`Удалить атаку ${attack.name}`"
                :title="`Удалить атаку ${attack.name}`"
                @click="removeAttack(attack)"
              />
            </div>
          </div>

          <p v-if="attacks.length === 0" class="empty-message">Пока нет атак.</p>
        </div>

        <v-btn
          v-if="!isAddFormVisible"
          variant="flat"
          block
          class="attacks__add-button"
          prepend-icon="mdi-plus"
          @click="handleShowAddForm"
        >
          Добавить атаку/заклинание
        </v-btn>

        <v-form v-else class="attacks__add-form" @submit.prevent="handleAddAttack">
          <v-text-field
            v-model="newAttackName"
            label="Название атаки"
            maxlength="200"
            density="compact"
            variant="outlined"
            hide-details
            required
          />

          <v-text-field
            v-model.number="newAttackBonus"
            label="Бонус атаки"
            type="number"
            min="-99"
            max="99"
            density="compact"
            variant="outlined"
            hide-details
          />

          <v-text-field
            v-model="newAttackDamage"
            label="Урон/вид"
            maxlength="200"
            density="compact"
            variant="outlined"
            hide-details
            required
          />

          <div class="attacks__add-actions">
            <v-btn color="primary" type="submit" :loading="isAdding" :disabled="isAdding">
              Добавить
            </v-btn>

            <v-btn
              class="attacks__cancel-button"
              variant="outlined"
              :disabled="isAdding"
              @click="handleCancelAddForm"
            >
              Отмена
            </v-btn>
          </div>
        </v-form>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="error-message"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>
    </v-card>
  </section>
</template>

<style scoped>
.attacks-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--page-surface);
  color: var(--text-color);
}

.section-header {
  display: block;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 2px solid var(--accent-color);
  background: transparent;
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.section-header h2 {
  margin: 0;
  color: var(--heading-color);
  font-size: 1.2rem;
  font-weight: 800;
}

.attacks-table {
  width: 100%;
  min-width: 0;
}

.table-header,
.attack-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(110px, 0.8fr) minmax(0, 1.5fr) 36px;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.table-header {
  border-bottom: 1px solid var(--border-color);
  color: var(--heading-color);
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
}

.attack-row {
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.attack-row input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-color);
  font: inherit;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.attack-row input:hover {
  border-color: var(--border-color);
  background: var(--page-background);
}

.attack-row input:focus {
  border-color: var(--accent-color);
  background: var(--page-surface);
  color: var(--text-color);
  outline: 2px solid var(--accent-color);
  outline-offset: 1px;
}

.attacks__add-form {
  display: grid;
  grid-template-columns:
    minmax(0, 2fr)
    minmax(100px, 1fr)
    minmax(0, 1.5fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--page-background);
}

.attacks__add-form :deep(.v-field) {
  background: var(--page-surface);
  color: var(--text-color);
}

.attacks__add-form :deep(.v-field__outline) {
  color: var(--border-color);
}

.attacks__add-form :deep(.v-field--focused .v-field__outline) {
  color: var(--accent-color);
}

.attacks__add-form :deep(.v-field__input),
.attacks__add-form :deep(input) {
  color: var(--text-color);
  opacity: 1;
}

.attacks__add-form :deep(.v-label) {
  color: var(--text-muted);
  opacity: 1;
}

.attacks__add-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.attacks__add-button,
.attacks__add-actions button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
  letter-spacing: 0.017857em;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.attacks__add-button :deep(.v-btn__content),
.attacks__add-actions button :deep(.v-btn__content) {
  color: var(--button-text) !important;
}

.attacks__add-button:hover,
.attacks__add-actions button:not(.attacks__cancel-button):hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.attacks__cancel-button {
  border-color: var(--border-color) !important;
  color: var(--text-color) !important;
  background: var(--page-surface) !important;
}

.attacks__cancel-button:hover:not(:disabled) {
  border-color: var(--card-hover-border) !important;
  color: var(--accent-color) !important;
  background: var(--page-background) !important;
}

.attacks__add-button:disabled,
.attacks__add-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.row-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--delete-text);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.icon-button:hover {
  border-color: var(--delete-border);
  background: var(--delete-hover-background);
}

.icon-button:focus-visible,
.attacks__add-button:focus-visible,
.attacks__add-actions button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.row-actions :deep(.v-btn) {
  color: var(--delete-text);
}

.row-actions :deep(.v-btn:hover) {
  color: var(--delete-text);
  background: var(--delete-hover-background);
}

.empty-message {
  margin: 0;
  padding: 16px 12px;
  color: var(--text-muted);
  text-align: center;
}

.error-message {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--delete-border);
  border-radius: 7px;
  background: var(--delete-background);
  color: var(--delete-text);
}

@media (max-width: 650px) {
  .attacks-section {
    padding: 14px;
  }

  .table-header {
    display: none;
  }

  .attack-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    padding: 10px 4px;
  }

  .attack-row input:first-child {
    grid-column: 1 / -1;
    font-weight: 600;
  }

  .row-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
  }

  .attacks__add-form {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    padding: 10px;
  }

  .attacks__add-form :deep(.v-input:first-child),
  .attacks__add-form :deep(.v-input:nth-child(3)) {
    grid-column: 1 / -1;
  }
}
</style>
