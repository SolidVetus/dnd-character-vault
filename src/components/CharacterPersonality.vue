<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { updatePersonality, type Character } from '../api/characters'

interface Props {
  characterId: string
  personality: Character['personality']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [personality: Character['personality']]
  saved: [message: string]
  error: [message: string]
}>()

const isEditing = ref(false)
const isSaving = ref(false)

const form = reactive({
  traits: '',
  ideals: [] as string[],
  bonds: [] as string[],
  flaws: [] as string[],
})

function syncForm() {
  form.traits = props.personality.traits ?? ''
  form.ideals = [...(props.personality.ideals ?? [])]
  form.bonds = [...(props.personality.bonds ?? [])]
  form.flaws = [...(props.personality.flaws ?? [])]
}

watch(() => props.personality, syncForm, {
  immediate: true,
  deep: true,
})

function addEntry(field: 'ideals' | 'bonds' | 'flaws') {
  form[field].push('')
}

function removeEntry(field: 'ideals' | 'bonds' | 'flaws', index: number) {
  form[field].splice(index, 1)
}

function cancelEditing() {
  syncForm()
  isEditing.value = false
}

async function savePersonality() {
  if (isSaving.value) return

  isSaving.value = true

  const payload = {
    traits: form.traits.trim(),
    ideals: form.ideals.map((item) => item.trim()).filter(Boolean),
    bonds: form.bonds.map((item) => item.trim()).filter(Boolean),
    flaws: form.flaws.map((item) => item.trim()).filter(Boolean),
  }

  try {
    const personality = await updatePersonality(props.characterId, payload)

    emit('updated', personality)
    isEditing.value = false
    emit('saved', 'Личность сохранена.')
  } catch {
    emit('error', 'Не удалось сохранить личность.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="personality-stack">
    <!-- Черты характера -->
    <v-card class="personality-block mb-4" variant="outlined">
      <v-card-title class="personality-block__header">
        <span>Черты характера</span>

        <v-btn
          v-if="!isEditing"
          icon="mdi-pencil"
          size="small"
          variant="text"
          aria-label="Редактировать черты характера"
          @click="isEditing = true"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-textarea
          v-if="isEditing"
          v-model="form.traits"
          label="Черты характера"
          rows="3"
          auto-grow
          maxlength="5000"
          hide-details="auto"
        />

        <p v-else class="personality-block__text">
          {{ personality.traits || 'Не указаны' }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Идеалы -->
    <v-card class="personality-block mb-4" variant="outlined">
      <v-card-title class="personality-block__header">
        <span>Идеалы</span>

        <div class="personality-block__title-actions">
          <template v-if="isEditing">
            <v-btn
              icon="mdi-plus"
              size="small"
              variant="text"
              aria-label="Добавить идеал"
              @click="addEntry('ideals')"
            />
          </template>

          <v-btn
            v-else
            icon="mdi-pencil"
            size="small"
            variant="text"
            aria-label="Редактировать идеалы"
            @click="isEditing = true"
          />
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div v-if="isEditing" class="personality-block__entries">
          <p v-if="!form.ideals.length" class="personality-block__empty">Пока нет записей</p>

          <div
            v-for="(entry, index) in form.ideals"
            :key="`ideal-${index}`"
            class="personality-block__entry"
          >
            <v-text-field
              v-model="form.ideals[index]"
              label="Идеал"
              maxlength="1000"
              hide-details="auto"
            />

            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              aria-label="Удалить идеал"
              @click="removeEntry('ideals', index)"
            />
          </div>
        </div>

        <ul v-else-if="personality.ideals?.length" class="personality-block__list">
          <li v-for="(entry, index) in personality.ideals" :key="`ideal-${index}`">
            {{ entry }}
          </li>
        </ul>

        <p v-else class="personality-block__empty">Не указаны</p>
      </v-card-text>
    </v-card>

    <!-- Привязанности -->
    <v-card class="personality-block mb-4" variant="outlined">
      <v-card-title class="personality-block__header">
        <span>Привязанности</span>

        <div class="personality-block__title-actions">
          <template v-if="isEditing">
            <v-btn
              icon="mdi-plus"
              size="small"
              variant="text"
              aria-label="Добавить привязанность"
              @click="addEntry('bonds')"
            />
          </template>

          <v-btn
            v-else
            icon="mdi-pencil"
            size="small"
            variant="text"
            aria-label="Редактировать привязанности"
            @click="isEditing = true"
          />
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div v-if="isEditing" class="personality-block__entries">
          <p v-if="!form.bonds.length" class="personality-block__empty">Пока нет записей</p>

          <div
            v-for="(entry, index) in form.bonds"
            :key="`bond-${index}`"
            class="personality-block__entry"
          >
            <v-text-field
              v-model="form.bonds[index]"
              label="Привязанность"
              maxlength="1000"
              hide-details="auto"
            />

            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              aria-label="Удалить привязанность"
              @click="removeEntry('bonds', index)"
            />
          </div>
        </div>

        <ul v-else-if="personality.bonds?.length" class="personality-block__list">
          <li v-for="(entry, index) in personality.bonds" :key="`bond-${index}`">
            {{ entry }}
          </li>
        </ul>

        <p v-else class="personality-block__empty">Не указаны</p>
      </v-card-text>
    </v-card>

    <!-- Слабости -->
    <v-card class="personality-block mb-4" variant="outlined">
      <v-card-title class="personality-block__header">
        <span>Слабости</span>

        <div class="personality-block__title-actions">
          <template v-if="isEditing">
            <v-btn
              icon="mdi-plus"
              size="small"
              variant="text"
              aria-label="Добавить слабость"
              @click="addEntry('flaws')"
            />
          </template>

          <v-btn
            v-else
            icon="mdi-pencil"
            size="small"
            variant="text"
            aria-label="Редактировать слабости"
            @click="isEditing = true"
          />
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div v-if="isEditing" class="personality-block__entries">
          <p v-if="!form.flaws.length" class="personality-block__empty">Пока нет записей</p>

          <div
            v-for="(entry, index) in form.flaws"
            :key="`flaw-${index}`"
            class="personality-block__entry"
          >
            <v-text-field
              v-model="form.flaws[index]"
              label="Слабость"
              maxlength="1000"
              hide-details="auto"
            />

            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              aria-label="Удалить слабость"
              @click="removeEntry('flaws', index)"
            />
          </div>
        </div>

        <ul v-else-if="personality.flaws?.length" class="personality-block__list">
          <li v-for="(entry, index) in personality.flaws" :key="`flaw-${index}`">
            {{ entry }}
          </li>
        </ul>

        <p v-else class="personality-block__empty">Не указаны</p>
      </v-card-text>
    </v-card>

    <!-- Кнопки редактирования -->
    <div v-if="isEditing" class="personality-stack__actions">
      <v-btn variant="text" :disabled="isSaving" @click="cancelEditing"> Отмена </v-btn>

      <v-btn color="primary" :loading="isSaving" @click="savePersonality"> Сохранить </v-btn>
    </div>
  </div>
</template>

<style scoped>
.personality-block__header,
.personality-block__entry,
.personality-stack__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.personality-block__title-actions {
  display: flex;
  align-items: center;
}

.personality-block__text {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.personality-block__list {
  margin: 0;
  padding-left: 18px;
}

.personality-block__list li + li {
  margin-top: 6px;
}

.personality-block__empty {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.9rem;
}

.personality-block__entries {
  display: grid;
  gap: 8px;
}

.personality-block__entry {
  gap: 4px;
}

.personality-block__entry :deep(.v-input) {
  flex: 1;
  min-width: 0;
}

.personality-stack__actions {
  justify-content: flex-end;
  gap: 8px;
  margin: 0 0 16px;
}
</style>
