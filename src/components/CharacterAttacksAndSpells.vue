<script setup lang="ts">
import { ref } from 'vue'
import {
  createCharacterAttack,
  updateCharacterAttack,
  deleteCharacterAttack,
} from '@/api/characters'
import type { CharacterAttack } from '@/api/characters'

const props = defineProps<{
  characterId: string
  attacks: CharacterAttack[]
}>()

const emit = defineEmits<{
  'update:attacks': [attacks: CharacterAttack[]]
}>()

interface AttackDraft {
  name: string
  attackBonus: number | null
  damage: string
}

const newAttack = ref<AttackDraft | null>(null)
const isSaving = ref(false)
const errorMessage = ref('')

function startAdding() {
  errorMessage.value = ''
  newAttack.value = {
    name: '',
    attackBonus: null,
    damage: '',
  }
}

function cancelAdding() {
  newAttack.value = null
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

function updateNewAttack(field: 'name' | 'attackBonus' | 'damage', value: string | number | null) {
  if (!newAttack.value) return

  newAttack.value = {
    ...newAttack.value,
    [field]: value,
  }
}

async function saveNewAttack() {
  const draft = newAttack.value

  if (!draft || isSaving.value) return

  if (!draft.name.trim() && !draft.damage.trim() && draft.attackBonus === null) {
    cancelAdding()
    return
  }

  if (!draft.name.trim() || !draft.damage.trim()) {
    errorMessage.value = 'Заполни название и урон.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const createdAttack = await createCharacterAttack(props.characterId, {
      name: draft.name.trim(),
      attackBonus: draft.attackBonus,
      damage: draft.damage.trim(),
      note: null,
    })

    emit('update:attacks', [...props.attacks, createdAttack])
    newAttack.value = null
  } catch {
    errorMessage.value = 'Не удалось сохранить атаку.'
  } finally {
    isSaving.value = false
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
  <section class="attacks-section">
    <div class="section-header">
      <h2>Атаки и заклинания</h2>

      <button v-if="!newAttack" type="button" class="add-button" @click="startAdding">
        + Добавить
      </button>
    </div>

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
          @input="updateAttackDraft(attack.id, 'name', ($event.target as HTMLInputElement).value)"
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
          @input="updateAttackDraft(attack.id, 'damage', ($event.target as HTMLInputElement).value)"
          @change="saveEditedAttack(attack.id)"
        />

        <div class="row-actions">
          <button
            type="button"
            class="icon-button delete-button"
            :aria-label="`Удалить атаку ${attack.name}`"
            :title="`Удалить атаку ${attack.name}`"
            @click="removeAttack(attack)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="m19 6-1 14H6L5 6" />
              <path d="M10 11v5M14 11v5" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="newAttack" class="attack-row new-attack-row">
        <input
          :value="newAttack.name"
          type="text"
          maxlength="200"
          placeholder="Название атаки"
          aria-label="Название новой атаки"
          @input="updateNewAttack('name', ($event.target as HTMLInputElement).value)"
        />

        <input
          :value="newAttack.attackBonus ?? ''"
          type="number"
          min="-99"
          max="99"
          placeholder="—"
          aria-label="Бонус новой атаки"
          @input="
            updateNewAttack(
              'attackBonus',
              ($event.target as HTMLInputElement).value === ''
                ? null
                : Number(($event.target as HTMLInputElement).value),
            )
          "
        />

        <input
          :value="newAttack.damage"
          type="text"
          maxlength="200"
          placeholder="Например, +3 рубящий"
          aria-label="Урон новой атаки"
          @input="updateNewAttack('damage', ($event.target as HTMLInputElement).value)"
        />

        <div class="row-actions">
          <button type="button" class="text-button" :disabled="isSaving" @click="saveNewAttack">
            {{ isSaving ? 'Сохранение…' : 'Сохранить' }}
          </button>

          <button type="button" class="text-button" :disabled="isSaving" @click="cancelAdding">
            Отмена
          </button>
        </div>
      </div>

      <p v-if="attacks.length === 0 && !newAttack" class="empty-message">Пока нет атак.</p>
    </div>

    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>
  </section>
</template>

<style scoped>
.attacks-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
}

.attacks-table {
  width: 100%;
}

.table-header,
.attack-row {
  display: grid;
  grid-template-columns:
    minmax(0, 2fr)
    minmax(100px, 1fr)
    minmax(0, 1.5fr)
    auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.table-header {
  font-weight: 600;
  border-bottom: 1px solid #ccc;
}

.attack-row {
  border-bottom: 1px solid #e5e5e5;
}

.attack-row input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
}

.attack-row input:hover,
.attack-row input:focus {
  border-color: #ccc;
  background: white;
  color: #222;
  outline: none;
}

.new-attack-row {
  background: #f8f8f8;
}

.new-attack-row input {
  border-color: #ccc;
  background: white;
  color: #222;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.add-button {
  padding: 8px 12px;
}

.text-button {
  padding: 4px;
  border: none;
  background: none;
  text-decoration: underline;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
}

.icon-button:hover {
  background: #f3f3f3;
}

.empty-message {
  padding: 12px;
  color: #777;
}

.error-message {
  margin: 0;
  color: #b42318;
}

@media (max-width: 650px) {
  .table-header {
    display: none;
  }

  .attack-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .row-actions {
    grid-column: 1 / -1;
  }
}
</style>
