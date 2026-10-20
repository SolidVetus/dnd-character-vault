<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import {
  getCharacter,
  type AbilityId,
  type Character,
  type CharacterSkill,
} from '../api/characters'

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
const identityForm = reactive({
  characterName: '',
  playerName: '',
  classLevel: '',
  race: '',
  background: '',
  alignment: '',
  experiencePoints: 0,
  age: null as number | null,
})

const saveMessage = ref('')

onMounted(async () => {
  try {
    character.value = await getCharacter(props.characterId)
    Object.assign(identityForm, {
      characterName: character.value.identity.characterName,
      playerName: character.value.identity.playerName,
      classLevel: character.value.identity.classLevel,
      race: character.value.identity.race,
      background: character.value.identity.background,
      alignment: character.value.identity.alignment,
      experiencePoints: character.value.identity.experiencePoints,
      age: character.value.identity.age,
    })
  } catch {
    error.value = 'Не удалось загрузить персонажа. Проверь, запущен ли API.'
  } finally {
    loading.value = false
  }
})

function handleIdentityUpdated(identity: Character['identity']) {
  if (!character.value) return
  character.value.identity = identity
}

function handleAbilitiesUpdated(ability: AbilityId, value: { score: number; mod: number }) {
  if (!character.value) return
  character.value.abilities[ability] = value
}

function handleSavingThrowUpdated(updatedSavingThrow: Character['savingThrows'][number]) {
  if (!character.value) return
  const index = character.value.savingThrows.findIndex(
    (item) => item.ability === updatedSavingThrow.ability,
  )

  if (index !== -1) {
    character.value.savingThrows[index] = updatedSavingThrow
  }
}

function handleSkillUpdated(updatedSkill: CharacterSkill) {
  if (!character.value) return

  const index = character.value.skills.findIndex((item) => item.id === updatedSkill.id)

  if (index !== -1) {
    character.value.skills[index] = updatedSkill
  }
}

function handleProficiencyBonusUpdated(value: number) {
  if (!character.value) return
  character.value.proficiencyBonus = value
}

function handlePassivePerceptionUpdated(value: number) {
  if (!character.value) return
  character.value.passivePerception = value
}

function handleProficienciesAndLanguagesUpdated(items: string[]) {
  if (!character.value) return
  character.value.proficienciesAndLanguages = items
}

function handleCombatUpdated(combat: Character['combat']) {
  if (!character.value) return
  character.value.combat = combat
}

function handleAttacksUpdated(attacks: Character['attacks']) {
  if (!character.value) return
  character.value.attacks = attacks
}

function handleEquipmentUpdated(equipment: Character['equipment']) {
  if (!character.value) return
  character.value.equipment = equipment
}

function handlePersonalityUpdated(personality: Character['personality']) {
  if (!character.value) return
  character.value.personality = personality
}

function handleFeaturesUpdated(features: Character['features']) {
  if (!character.value) return
  character.value.features = features
}

function handleSaved(message: string) {
  saveMessage.value = message
}

function handleError(message: string) {
  error.value = message
}
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

      <CharacterIdentity
        :character-id="character.id"
        :identity="character.identity"
        @updated="handleIdentityUpdated"
        @saved="handleSaved"
        @error="handleError"
      />

      <CharacterAbilities
        :character-id="character.id"
        :abilities="character.abilities"
        @updated="handleAbilitiesUpdated"
      />

      <CharacterProficiencyBonus
        :character-id="character.id"
        :proficiency-bonus="character.proficiencyBonus ?? 2"
        @updated="handleProficiencyBonusUpdated"
        @saved="handleSaved"
        @error="handleError"
      />

      <CharacterSavingThrows
        :character-id="character.id"
        :saving-throws="character.savingThrows"
        @updated="handleSavingThrowUpdated"
        @saved="handleSaved"
        @error="handleError"
      />
      <CharacterSkills
        :character-id="character.id"
        :skills="character.skills"
        @updated="handleSkillUpdated"
        @saved="handleSaved"
        @error="handleError"
      />
      <CharacterPassivePerception
        :character-id="character.id"
        :passive-perception="character.passivePerception ?? 10"
        @updated="handlePassivePerceptionUpdated"
        @saved="handleSaved"
        @error="handleError"
      />
      <CharacterProficienciesAndLanguages
        :character-id="character.id"
        :items="character.proficienciesAndLanguages"
        @updated="handleProficienciesAndLanguagesUpdated"
        @saved="handleSaved"
        @error="handleError"
      />
      <CharacterCombatStats
        :character-id="character.id"
        :combat="character.combat"
        @updated="handleCombatUpdated"
        @saved="handleSaved"
        @error="handleError"
      />
      <CharacterAttacksAndSpells
        :character-id="character.id"
        :attacks="character.attacks"
        @update:attacks="handleAttacksUpdated"
      />
      <CharacterEquipment
        :character-id="character.id"
        :equipment="character.equipment"
        @updated="handleEquipmentUpdated"
        @saved="handleSaved"
        @error="handleError"
      />

      <CharacterPersonality
        :character-id="character.id"
        :personality="character.personality"
        @updated="handlePersonalityUpdated"
        @saved="handleSaved"
        @error="handleError"
      />
      <CharacterFeatures
        :character-id="character.id"
        :features="character.features"
        @updated="handleFeaturesUpdated"
      />
    </template>
  </v-container>
</template>
