<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createCharacter, deleteCharacter, getAllCharacters } from './api/characters'
import CharacterSheet from './components/CharacterSheet.vue'

interface CharacterPreview {
  id: string
  characterName: string
  avatarUrl: string | null
}

const characters = ref<CharacterPreview[]>([])
const isLoading = ref(false)
const error = ref('')
const openedCharacterId = ref<string | null>(null)

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

    if (openedCharacterId.value === id) {
      openedCharacterId.value = null
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось удалить персонажа'
  }
}
</script>

<template>
  <v-app>
    <v-app-bar flat border>
      <v-container class="d-flex align-center">
        <v-icon icon="mdi-dice-d20" size="32" color="red" class="mr-3" />

        <v-toolbar-title class="font-weight-bold"> Character Vault </v-toolbar-title>

        <v-spacer />

        <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreateCharacter">
          Создать персонажа
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="py-8">
        <CharacterSheet
          v-if="openedCharacterId"
          :character-id="openedCharacterId"
          @back="openedCharacterId = null"
        />

        <template v-else>
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

          <div class="mb-8">
            <h1 class="text-h4 font-weight-bold mb-2">Мои персонажи</h1>

            <p class="text-body-1 text-medium-emphasis">Твои приключения начинаются здесь.</p>
          </div>

          <v-row v-if="!isLoading && characters.length > 0">
            <v-col v-for="character in characters" :key="character.id" cols="12" sm="6" md="4">
              <v-card rounded="lg" border flat class="h-100">
                <v-img
                  :src="
                    character.avatarUrl ? `http://127.0.0.1:3000${character.avatarUrl}` : '/img/placeholderImg.webp'
                  "
                  height="220"
                  cover
                  class="bg-grey-lighten-4"
                />

                <v-card-item>
                  <v-card-title class="font-weight-bold">
                    {{ character.characterName }}
                  </v-card-title>
                </v-card-item>

                <v-divider />

                <v-card-actions class="pa-4">
                  <v-btn
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-pencil"
                    flex-grow-1
                    @click="openedCharacterId = character.id"
                  >
                    Открыть лист
                  </v-btn>

                  <v-btn
                    variant="tonal"
                    color="error"
                    icon="mdi-delete"
                    aria-label="Удалить персонажа"
                    @click="handleDeleteCharacter(character.id)"
                  />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>
