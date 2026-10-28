<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createCharacter, deleteCharacter, getAllCharacters } from './api/characters'
import CharacterSheet from './components/CharacterSheet.vue'
import { getAvatarUrl } from '@/utils/avatar'

interface CharacterPreview {
  id: string
  characterName: string
  avatarUrl: string | null
}

const characters = ref<CharacterPreview[]>([])
const isLoading = ref(false)
const error = ref('')
const openedCharacterId = ref<string | null>(null)

const isDarkTheme = ref(false)

const themeIcon = computed(() => (isDarkTheme.value ? 'mdi-weather-sunny' : 'mdi-weather-night'))

const themeLabel = computed(() => (isDarkTheme.value ? 'Светлая тема' : 'Тёмная тема'))

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
  openedCharacterId.value = null
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
  <v-app :theme="isDarkTheme ? 'dark' : 'light'" :class="{ 'theme-dark': isDarkTheme }">
    <v-app-bar flat class="app-header">
      <v-container class="d-flex align-center app-header__content">
        <v-icon icon="mdi-dice-d20" size="32" class="app-header__icon mr-3" />

        <v-toolbar-title class="font-weight-bold app-header__title">
          Character Vault
        </v-toolbar-title>

        <v-spacer />

        <v-btn
          v-if="openedCharacterId"
          class="app-header__create-button mr-2"
          @click="openedCharacterId = null"
        >
          Список персонажей
        </v-btn>

        <v-btn
          prepend-icon="mdi-plus"
          class="app-header__create-button"
          @click="handleCreateCharacter"
        >
          Создать персонажа
        </v-btn>

        <v-btn
          icon
          variant="text"
          class="theme-toggle ml-2"
          :aria-label="themeLabel"
          :title="themeLabel"
          @click="isDarkTheme = !isDarkTheme"
        >
          <v-icon :icon="themeIcon" />
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="home-page">
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
                    @click="openedCharacterId = character.id"
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
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
:root {
  color-scheme: light;
  --page-background: #f7f0e5;
  --page-surface: #fffaf3;
  --border-color: #d8cbbb;
  --heading-color: #3e2723;
  --text-color: #3e2723;
  --text-muted: #78675d;
  --accent-color: #bf360c;

  --button-border: #6f2b22;
  --button-background: #bf360c;
  --button-text: #fffdf8;
  --button-hover-border: #e64a19;
  --button-hover-background: #e64a19;

  --card-hover-border: #bf360c;
  --image-background: #f1e7d8;

  --delete-border: #d8b9ad;
  --delete-background: #fff4ef;
  --delete-text: #9f2d20;
  --delete-hover-border: #9f2d20;
  --delete-hover-background: #fbe2d8;

  --theme-toggle-color: #3e2723;
  --dice-icon-color: #bf360c;
}

:root:has(.v-application.theme-dark) {
  color-scheme: dark;
  --page-background: #1f1c25;
  --page-surface: #342f3e;
  --border-color: #6d5f7d;
  --heading-color: #cea87b;
  --text-color: #eae3d8;
  --text-muted: #eae3d8;
  --accent-color: #cea87b;

  --button-border: #6d5f7d;
  --button-background: #6d5f7d;
  --button-text: #ffffff;
  --button-hover-border: #5c3a9f;
  --button-hover-background: #5b4e69;

  --card-hover-border: #5c3a9f;
  --image-background: #1d172a;

  --delete-border: #6d5f7d;
  --delete-background: #292431;
  --delete-text: #eae3d8;
  --delete-hover-border: #5c3a9f;
  --delete-hover-background: #5b4e69;

  --theme-toggle-color: #cea87b;
  --dice-icon-color: #64b5f6;
}

html,
body,
#app,
.v-application,
.v-application__wrap {
  min-height: 100%;
}

html,
body,
#app,
.v-application,
.v-application__wrap,
.v-main {
  background: var(--page-background) !important;
  color: var(--text-color);
}

html,
body,
#app,
.v-application,
.v-application__wrap,
.v-main,
.app-header,
.home-page,
.character-card,
.character-card__image,
.character-card__title,
.app-header__title,
.app-header__icon,
.home-page__title,
.home-page__subtitle,
.character-card__open-button,
.character-card__delete-button,
.theme-toggle {
  transition:
    background-color 0.3s ease-out,
    color 0.3s ease-out,
    border-color 0.3s ease-out;
}

.app-header {
  background: var(--page-surface);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.app-header__content {
  max-width: 1680px;
  padding-inline: 16px;
}

.app-header__icon {
  color: var(--dice-icon-color);
}

.app-header__title {
  color: var(--heading-color);
  letter-spacing: 0.01em;
}

.app-header__create-button {
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

.app-header__create-button:hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.home-page {
  max-width: 1440px;
  color: var(--text-color);
}

.home-page__title {
  color: var(--heading-color);
}

.home-page__subtitle {
  color: var(--text-muted) !important;
}

.character-grid {
  row-gap: 16px;
}

.character-card {
  overflow: hidden;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  background: var(--page-surface);
  color: var(--text-color);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.character-card:hover {
  border-color: var(--card-hover-border) !important;
  transform: translateY(-2px);
}

.character-card__image {
  background: var(--image-background);
}

.character-card__image .v-img__img {
  object-position: top center;
}

.character-card__title {
  color: var(--heading-color);
  overflow-wrap: anywhere;
}

.character-card__actions {
  gap: 12px;
}

.character-card__open-button {
  flex: 1 1 auto;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.character-card__open-button:hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.character-card__delete-button {
  border: 1px solid var(--delete-border);
  border-radius: 8px;
  max-height: 40px;
  max-width: 40px;
  background: var(--delete-background);
  color: var(--delete-text);
}

.character-card__delete-button:hover {
  border-color: var(--delete-hover-border);
  background: var(--delete-hover-background);
}

.theme-toggle {
  flex: 0 0 auto;
  color: var(--theme-toggle-color);
}

@media (max-width: 600px) {
  .app-header__title {
    font-size: 1rem;
  }

  .app-header__create-button {
    padding-inline: 10px;
    font-size: 0.75rem;
  }
}
</style>
