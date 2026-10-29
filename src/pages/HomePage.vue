<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createCharacter, deleteCharacter, getAllCharacters } from '@/api/characters'
import { getAvatarUrl } from '@/utils/avatar'

interface CharacterPreview {
  id: string
  characterName: string
  avatarUrl: string | null
}

const characters = ref<CharacterPreview[]>([])
const isLoading = ref(false)
const error = ref('')

onMounted(async () => {
  isLoading.value = true
  error.value = ''

  try {
    characters.value = await getAllCharacters()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось загрузить персонажей'
  } finally {
    isLoading.value = false
  }
})

async function handleCreateCharacter() {
  error.value = ''

  try {
    const newCharacter = await createCharacter()
    characters.value.push(newCharacter)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось создать персонажа'
  }
}

async function handleDeleteCharacter(id: string) {
  error.value = ''

  try {
    await deleteCharacter(id)
    characters.value = characters.value.filter((character) => character.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось удалить персонажа'
  }
}
</script>

<template>
  <v-alert v-if="isLoading" type="info" variant="tonal" class="mb-4">
    Загружаем персонажей...
  </v-alert>

  <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
    {{ error }}
  </v-alert>

  <v-alert
    v-else-if="!isLoading && characters.length === 0"
    type="info"
    variant="tonal"
    class="mb-4"
  >
    Персонажей пока нет.
  </v-alert>

  <div class="mb-8 home-page__intro">
    <h1 class="text-h4 font-weight-bold mb-2 home-page__title">Мои персонажи</h1>
    <p class="text-body-1 text-medium-emphasis home-page__subtitle">
      Твои приключения начинаются здесь.
    </p>
  </div>

  <v-row v-if="!isLoading && characters.length > 0" class="character-grid">
    <v-col v-for="character in characters" :key="character.id" cols="12" sm="6" md="3">
      <v-card rounded="lg" border flat class="h-100 character-card">
        <v-img
          :src="getAvatarUrl(character.avatarUrl) || '/img/placeholderImg.webp'"
          height="380"
          cover
          class="bg-grey-lighten-4 character-card__image"
        />

        <v-card-item>
          <v-card-title class="font-weight-bold character-card__title">
            {{ character.characterName }}
          </v-card-title>
        </v-card-item>

        <v-divider />

        <v-card-actions class="pa-4 character-card__actions">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-pencil"
            class="character-card__open-button"
            :to="{ name: 'character', params: { id: character.id } }"
          >
            Открыть лист
          </v-btn>

          <v-btn
            variant="tonal"
            color="error"
            icon="mdi-delete"
            aria-label="Удалить персонажа"
            class="character-card__delete-button"
            @click="handleDeleteCharacter(character.id)"
          />
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <v-btn
    v-if="characters.length === 0 && !isLoading"
    prepend-icon="mdi-plus"
    class="home-page__create-button"
    @click="handleCreateCharacter"
  >
    Создать персонажа
  </v-btn>
</template>
