<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '@/stores/useCharacterStore'

import CharacterIdentity from './CharacterIdentity.vue'
import CharacterAbilities from './CharacterAbilities.vue'
import CharacterSavingThrows from './CharacterSavingThrows.vue'
import CharacterSkills from './CharacterSkills.vue'
import CharacterProficiencyBonus from './CharacterProficiencyBonus.vue'
import CharacterPassivePerception from './CharacterPassivePerception.vue'
import CharacterProficienciesAndLanguages from './CharacterProficienciesAndLanguages.vue'
import CharacterCombatStats from './CharacterCombatStats.vue'
import CharacterAttacksAndSpells from './CharacterAttacksAndSpells.vue'
import CharacterEquipment from './CharacterEquipment.vue'
import CharacterPersonality from './CharacterPersonality.vue'
import CharacterFeatures from './CharacterFeatures.vue'
import CharacterInspiration from './CharacterInspiration.vue'

interface Props {
  characterId: string
}

const props = defineProps<Props>()

const characterStore = useCharacterStore()

const { character, loading, error } = storeToRefs(characterStore)

const saveMessage = ref('')

watch(
  () => props.characterId,
  (id) => {
    void characterStore.loadCharacter(id)
  },
  { immediate: true },
)

function handleSaved(message: string) {
  saveMessage.value = message
}

function handleError(message: string) {
  error.value = message
}
</script>

<template>
  <v-container class="character-sheet">
    <div v-if="loading" class="character-sheet__status">
      <v-progress-circular indeterminate />
      <p>Загружаем персонажа...</p>
    </div>

    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-else-if="character">
      <header class="character-sheet__header">
        <div class="character-sheet__heading">
          <p class="character-sheet__eyebrow">ЛИСТ ПЕРСОНАЖА</p>

          <h1 class="character-sheet__title">
            {{ character.identity.characterName || 'Новый персонаж' }}
          </h1>

          <p class="character-sheet__id">ID: {{ character.id }}</p>
        </div>

        <section class="character-sheet__identity">
          <CharacterIdentity
            :character-id="character.id"
            :identity="character.identity"
            @updated="characterStore.updateCharacter('identity', $event)"
            @saved="handleSaved"
            @error="handleError"
          />
        </section>
      </header>

      <div class="character-sheet__layout">
        <div class="character-sheet__column">
          <CharacterAbilities
            :character-id="character.id"
            :abilities="character.abilities"
            @updated="(ability, value) => characterStore.updateAbilities(ability, value)"
          />

          <CharacterInspiration
            :character-id="character.id"
            :inspiration="character.inspiration"
            @updated="characterStore.updateCharacter('inspiration', $event)"
            @saved="handleSaved"
            @error="handleError"
          />

          <CharacterProficiencyBonus
            :character-id="character.id"
            :proficiency-bonus="character.proficiencyBonus ?? 2"
            @updated="characterStore.updateCharacter('proficiencyBonus', $event)"
            @saved="handleSaved"
            @error="handleError"
          />

          <CharacterSavingThrows
            :character-id="character.id"
            :saving-throws="character.savingThrows"
            @updated="characterStore.updateSavingThrow($event)"
            @saved="handleSaved"
            @error="handleError"
          />

          <CharacterSkills
            :character-id="character.id"
            :skills="character.skills"
            @updated="characterStore.updateSkill($event)"
            @saved="handleSaved"
            @error="handleError"
          />

          <CharacterPassivePerception
            :character-id="character.id"
            :passive-perception="character.passivePerception ?? 10"
            @updated="characterStore.updateCharacter('passivePerception', $event)"
            @saved="handleSaved"
            @error="handleError"
          />
        </div>

        <div class="character-sheet__column">
          <CharacterCombatStats
            :character-id="character.id"
            :combat="character.combat"
            @updated="characterStore.updateCharacter('combat', $event)"
            @saved="handleSaved"
            @error="handleError"
          />

          <CharacterAttacksAndSpells
            :character-id="character.id"
            :attacks="character.attacks"
            @update:attacks="characterStore.updateCharacter('attacks', $event)"
          />

          <CharacterFeatures
            :character-id="character.id"
            :features="character.features"
            @updated="characterStore.updateCharacter('features', $event)"
          />
        </div>

        <div class="character-sheet__column">
          <CharacterProficienciesAndLanguages
            :character-id="character.id"
            :items="character.proficienciesAndLanguages"
            @updated="characterStore.updateCharacter('proficienciesAndLanguages', $event)"
            @saved="handleSaved"
            @error="handleError"
          />

          <CharacterEquipment
            :character-id="character.id"
            :equipment="character.equipment"
            @updated="characterStore.updateCharacter('equipment', $event)"
            @saved="handleSaved"
            @error="handleError"
          />

          <CharacterPersonality
            :character-id="character.id"
            :personality="character.personality"
            @updated="characterStore.updateCharacter('personality', $event)"
            @saved="handleSaved"
            @error="handleError"
          />
        </div>
      </div>

      <v-snackbar v-if="saveMessage" timeout="2500">
        {{ saveMessage }}
      </v-snackbar>
    </template>
  </v-container>
</template>

<style scoped>
.character-sheet {
  width: min(100%, 1600px);
  margin-inline: auto;
  padding-bottom: 40px;
  color: var(--text-color);
  background: var(--page-background);
}

.character-sheet__status {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 48px 16px;
  color: var(--text-muted);
}

.character-sheet:deep(.v-btn) {
  border-color: var(--border-color);
  color: var(--accent-color);
}

.character-sheet:deep(.v-btn:hover) {
  color: var(--button-hover-border);
  background: var(--page-surface);
}

.character-sheet__header {
  display: grid;
  gap: 18px;
  margin-bottom: 24px;
  color: var(--text-color);
}

.character-sheet__heading {
  min-width: 0;
  padding: 20px 24px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
}

.character-sheet__eyebrow {
  margin: 0 0 8px;
  color: var(--accent-color);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1.4;
}

.character-sheet__title {
  margin: 0;
  color: var(--heading-color);
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.character-sheet__id {
  margin: 8px 0 0;
  color: var(--text-muted);
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.character-sheet__identity,
.character-sheet__column {
  min-width: 0;
}

.character-sheet__layout {
  display: grid;
  grid-template-columns:
    minmax(220px, 0.85fr)
    minmax(320px, 1.3fr)
    minmax(240px, 0.95fr);
  align-items: start;
  gap: 20px;
}

.character-sheet__column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 1100px) {
  .character-sheet__layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .character-sheet__column:last-child {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 16px;
  }
}

@media (max-width: 700px) {
  .character-sheet {
    padding-inline: 12px;
  }

  .character-sheet__heading {
    padding: 18px;
  }

  .character-sheet__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .character-sheet__column:last-child {
    grid-column: auto;
    grid-template-columns: minmax(0, 1fr);
  }

  .character-sheet__column {
    gap: 16px;
  }
}
</style>
