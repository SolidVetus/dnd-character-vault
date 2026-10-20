<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { updateCharacterAbility, type AbilityId, type Character } from '../api/characters'

interface Props {
  characterId: string
  abilities: Character['abilities']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [ability: AbilityId, value: { score: number; mod: number }]
}>()

const abilityNames: Record<AbilityId, string> = {
  str: 'Сила',
  dex: 'Ловкость',
  con: 'Телосложение',
  int: 'Интеллект',
  wis: 'Мудрость',
  cha: 'Харизма',
}

const abilityForms = reactive<Record<AbilityId, { score: number; mod: number }>>({
  str: { score: 10, mod: 0 },
  dex: { score: 10, mod: 0 },
  con: { score: 10, mod: 0 },
  int: { score: 10, mod: 0 },
  wis: { score: 10, mod: 0 },
  cha: { score: 10, mod: 0 },
})

watch(
  () => props.abilities,
  (abilities) => {
    for (const ability of Object.keys(abilityNames) as AbilityId[]) {
      Object.assign(abilityForms[ability], abilities[ability])
    }
  },
  { immediate: true, deep: true },
)

const savingAbility = ref<AbilityId | null>(null)
const error = ref('')
const saveMessage = ref('')

async function saveAbility(ability: AbilityId) {
  error.value = ''
  saveMessage.value = ''
  savingAbility.value = ability

  try {
    const updatedAbility = await updateCharacterAbility(props.characterId, ability, {
      score: abilityForms[ability].score,
      mod: abilityForms[ability].mod,
    })

    abilityForms[ability].score = updatedAbility.score
    abilityForms[ability].mod = updatedAbility.mod

    emit('updated', ability, {
      score: updatedAbility.score,
      mod: updatedAbility.mod,
    })

    saveMessage.value = `${abilityNames[ability]}: изменения сохранены.`
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Не удалось сохранить характеристику.'
  } finally {
    savingAbility.value = null
  }
}
</script>
<template>
  <section class="mb-6">
    <h2 class="text-h5 mb-3">Характеристики</h2>

    <v-row>
      <v-col
        v-for="ability in Object.keys(abilityNames) as AbilityId[]"
        :key="ability"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="pa-3" variant="outlined">
          <v-card-title class="text-subtitle-1">
            {{ abilityNames[ability] }}
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model.number="abilityForms[ability].score"
              label="Значение"
              type="number"
              min="1"
              max="30"
              density="compact"
            />

            <v-text-field
              v-model.number="abilityForms[ability].mod"
              label="Модификатор"
              type="number"
              min="-10"
              max="10"
              density="compact"
            />

            <v-btn
              color="primary"
              block
              :loading="savingAbility === ability"
              :disabled="savingAbility !== null"
              @click="saveAbility(ability)"
            >
              Сохранить
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="error" type="error" class="mt-3">
      {{ error }}
    </v-alert>

    <v-alert v-if="saveMessage" type="success" class="mt-3">
      {{ saveMessage }}
    </v-alert>
  </section>
</template>
