<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Character } from '@/types/character'
import { getAvatarUrl } from '@/utils/avatar'
import CharacterIdentityDialog from './modal/CharacterIdentityDialog.vue'

interface Props {
  characterId: string
  identity: Character['identity']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [identity: Character['identity']]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = ref(false)
const avatarUrl = computed(() => getAvatarUrl(props.identity.avatarUrl))
const identityDetails = computed(() => [
  { label: 'Игрок', value: props.identity.playerName },
  { label: 'Класс и уровень', value: props.identity.classLevel },
  { label: 'Раса', value: props.identity.race },
  { label: 'Предыстория', value: props.identity.background },
  { label: 'Мировоззрение', value: props.identity.alignment },
  { label: 'Опыт', value: props.identity.experiencePoints.toLocaleString('ru-RU') },
  { label: 'Возраст', value: props.identity.age === null ? '' : String(props.identity.age) },
])
</script>

<template>
  <section class="identity-section">
    <div class="section-header">
      <h2>Основная информация</h2>
    </div>

    <v-card width="100%" class="character-identity">
      <v-card-text class="section-content">
        <div class="identity-summary">
          <div class="identity-summary__body">
            <h3 class="identity-summary__name">
              {{ props.identity.characterName || 'Имя не указано' }}
            </h3>
            <dl class="identity-summary__details">
              <div v-for="detail in identityDetails" :key="detail.label">
                <dt>{{ detail.label }}</dt>
                <dd>{{ detail.value || '—' }}</dd>
              </div>
            </dl>
          </div>

          <div class="character-avatar character-avatar--summary">
            <v-img
              v-if="avatarUrl"
              :src="avatarUrl"
              alt="Аватар персонажа"
              contain
              width="100%"
              height="100%"
            />
            <v-icon v-else icon="mdi-account-circle" size="220" />
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="identity-summary__actions">
        <v-btn class="edit-identity-btn" prepend-icon="mdi-pencil" @click="dialogOpen = true">
          Редактировать
        </v-btn>
      </v-card-actions>
    </v-card>

    <CharacterIdentityDialog
      v-model="dialogOpen"
      :character-id="props.characterId"
      :identity="props.identity"
      @updated="emit('updated', $event)"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.character-identity {
  container: identity-card / inline-size;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
  box-shadow: none;
}

.identity-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  align-items: start;
  gap: 12px;
}

.identity-summary__body {
  min-width: 0;
}

.identity-summary__name {
  margin: 0 0 16px;
  color: var(--heading-color);
  font-size: 1.5rem;
  font-weight: 750;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.identity-summary__details {
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  gap: 18px;
  margin: 0;
}

.identity-summary__details > div {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--page-background);
}

.identity-summary__details dt {
  margin-bottom: 4px;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.3;
}

.identity-summary__details dd {
  margin: 0;
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.character-avatar {
  display: flex;
  align-self: flex-end;
  box-sizing: border-box;
  width: 100%;
  max-width: 280px;
  height: 280px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--image-background);
  color: var(--text-muted);
}

.character-avatar :deep(.v-img) {
  width: 100%;
  height: 100%;
}

.character-avatar :deep(.v-icon) {
  color: var(--text-muted);
}

.character-avatar--summary {
  flex: 0 0 240px;
  width: 240px;
  max-width: 240px;
  height: 240px;
}

.identity-summary__actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 16px 16px;
}

.edit-identity-btn {
  flex: 0 0 auto;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-bottom: 10px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--accent-color);
}

.section-header h2 {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.section-content {
  padding: 16px;
  color: var(--text-color);
}

.edit-identity-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}

@media (max-width: 960px) {
  .identity-summary__details {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }
  .character-avatar {
    align-self: center;
  }
}

@container identity-card (max-width: 600px) {
  .identity-summary {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .identity-summary__details {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  }

  .character-avatar--summary {
    justify-self: center;
  }

  .identity-summary__actions {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .section-content {
    padding: 12px;
  }

  .identity-summary__name {
    margin-bottom: 12px;
    font-size: 1.25rem;
  }

  .identity-summary__details > div {
    padding: 9px 10px;
  }

  .identity-summary__details dt {
    font-size: 0.85rem;
  }

  .identity-summary__details dd {
    font-size: 1rem;
  }

  .identity-summary__body {
    width: 100%;
  }

  .identity-summary__actions {
    padding: 0 12px 12px;
  }
}
</style>
