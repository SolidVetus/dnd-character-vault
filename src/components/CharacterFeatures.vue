<script setup lang="ts">
import { ref } from 'vue'
import {
  createCharacterFeature,
  updateCharacterFeature,
  deleteCharacterFeature,
  type CharacterFeature,
} from '@/api/characters'

const props = defineProps<{
  characterId: string
  features: CharacterFeature[]
}>()

const emit = defineEmits<{
  updated: [features: CharacterFeature[]]
}>()

const isAdding = ref(false)
const editingId = ref<string | null>(null)
const isSaving = ref(false)
const errorMessage = ref('')

const newFeature = ref({ name: '', description: '' })
const editedFeature = ref({ name: '', description: '' })

function startAdding() {
  newFeature.value = { name: '', description: '' }
  isAdding.value = true
  editingId.value = null
  errorMessage.value = ''
}

function startEditing(feature: CharacterFeature) {
  editedFeature.value = {
    name: feature.name,
    description: feature.description,
  }
  editingId.value = feature.id
  isAdding.value = false
  errorMessage.value = ''
}

async function addFeature() {
  const name = newFeature.value.name.trim()

  if (!name) {
    errorMessage.value = 'Укажите название умения.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const feature = await createCharacterFeature(props.characterId, {
      name,
      description: newFeature.value.description.trim(),
    })

    emit('updated', [...props.features, feature])
    isAdding.value = false
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось добавить умение.'
  } finally {
    isSaving.value = false
  }
}

async function saveFeature(feature: CharacterFeature) {
  const name = editedFeature.value.name.trim()

  if (!name) {
    errorMessage.value = 'Укажите название умения.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const updatedFeature = await updateCharacterFeature(props.characterId, feature.id, {
      name,
      description: editedFeature.value.description.trim(),
    })

    emit(
      'updated',
      props.features.map((item) => (item.id === updatedFeature.id ? updatedFeature : item)),
    )

    editingId.value = null
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось сохранить умение.'
  } finally {
    isSaving.value = false
  }
}

async function removeFeature(feature: CharacterFeature) {
  if (!window.confirm(`Удалить умение «${feature.name}»?`)) return

  isSaving.value = true
  errorMessage.value = ''

  try {
    await deleteCharacterFeature(props.characterId, feature.id)

    emit(
      'updated',
      props.features.filter((item) => item.id !== feature.id),
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось удалить умение.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="character-features">
    <header class="features-header">
      <h2>Умения и особенности</h2>
      <button type="button" :disabled="isSaving" @click="startAdding">Добавить умение</button>
    </header>

    <p v-if="errorMessage" class="error-message" role="alert">
      {{ errorMessage }}
    </p>

    <form v-if="isAdding" class="feature-form" @submit.prevent="addFeature">
      <label>
        Название
        <input v-model="newFeature.name" maxlength="200" required />
      </label>

      <label>
        Описание
        <textarea v-model="newFeature.description" maxlength="5000" rows="3" />
      </label>

      <div class="feature-actions">
        <button type="submit" :disabled="isSaving">
          {{ isSaving ? 'Сохранение…' : 'Сохранить' }}
        </button>
        <button type="button" :disabled="isSaving" @click="isAdding = false">Отмена</button>
      </div>
    </form>

    <p v-if="features.length === 0 && !isAdding" class="empty-state">
      Пока нет добавленных умений.
    </p>

    <article v-for="feature in features" :key="feature.id" class="feature-item">
      <form
        v-if="editingId === feature.id"
        class="feature-form"
        @submit.prevent="saveFeature(feature)"
      >
        <label>
          Название
          <input v-model="editedFeature.name" maxlength="200" required />
        </label>

        <label>
          Описание
          <textarea v-model="editedFeature.description" maxlength="5000" rows="3" />
        </label>

        <div class="feature-actions">
          <button type="submit" :disabled="isSaving">
            {{ isSaving ? 'Сохранение…' : 'Сохранить' }}
          </button>
          <button type="button" :disabled="isSaving" @click="editingId = null">Отмена</button>
        </div>
      </form>

      <template v-else>
        <div class="feature-heading">
          <h3>{{ feature.name }}</h3>

          <div class="feature-actions">
            <button type="button" :disabled="isSaving" @click="startEditing(feature)">
              Изменить
            </button>
            <button type="button" :disabled="isSaving" @click="removeFeature(feature)">
              Удалить
            </button>
          </div>
        </div>

        <p v-if="feature.description" class="feature-description">
          {{ feature.description }}
        </p>
      </template>
    </article>
  </section>
</template>

<style scoped>
.character-features {
  display: grid;
  gap: 1rem;
}

.features-header,
.feature-heading,
.feature-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.features-header h2,
.feature-heading h3 {
  margin: 0;
}

.feature-item,
.feature-form {
  display: grid;
  gap: 0.75rem;
}

.feature-item {
  padding: 1rem;
  border: 1px solid #d6d6d6;
  border-radius: 0.5rem;
}

.feature-form label {
  display: grid;
  gap: 0.3rem;
}

.feature-form input,
.feature-form textarea {
  box-sizing: border-box;
  width: 100%;
  font: inherit;
}

.feature-form textarea {
  resize: vertical;
}

.feature-actions {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.feature-description,
.empty-state {
  margin: 0;
  white-space: pre-wrap;
}

.error-message {
  margin: 0;
  color: #b42318;
}
</style>
