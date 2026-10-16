<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCharacter, type Character } from '../api/characters'

interface Props {
  characterId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
}>()

const character = ref<Character | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    character.value = await getCharacter(props.characterId)
  } catch {
    error.value = 'Не удалось загрузить персонажа. Проверь, запущен ли API.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container>
    <v-btn variant="outlined" class="mb-4" @click="emit('back')"> Назад к персонажам </v-btn>

    <div v-if="loading">
      <v-progress-circular indeterminate />
      <p>Загружаем персонажа...</p>
    </div>

    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-else-if="character">
      <h1 class="text-h4 mb-4">
        {{ character.identity.characterName || 'Новый персонаж' }}
      </h1>

      <p class="mb-4">Идентификатор: {{ character.id }}</p>

      <v-card max-width="600" class="pa-4">
        <v-card-title>Основная информация</v-card-title>

        <v-card-text>
          <p>Игрок: {{ character.identity.playerName || '—' }}</p>
          <p>Класс и уровень: {{ character.identity.classLevel || '—' }}</p>
          <p>Раса: {{ character.identity.race || '—' }}</p>
          <p>Предыстория: {{ character.identity.background || '—' }}</p>
          <p>Мировоззрение: {{ character.identity.alignment || '—' }}</p>
          <p>Опыт: {{ character.identity.experiencePoints }}</p>
          <p>Возраст: {{ character.identity.age ?? '—' }}</p>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>
