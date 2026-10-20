<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { updateCharacterIdentity, type Character } from '../api/characters'

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

const form = reactive({
  characterName: props.identity.characterName,
  playerName: props.identity.playerName,
  classLevel: props.identity.classLevel,
  race: props.identity.race,
  background: props.identity.background,
  alignment: props.identity.alignment,
  experiencePoints: props.identity.experiencePoints,
  age: props.identity.age,
})

const saving = ref(false)

watch(
  () => props.identity,
  (identity) => {
    Object.assign(form, {
      characterName: identity.characterName,
      playerName: identity.playerName,
      classLevel: identity.classLevel,
      race: identity.race,
      background: identity.background,
      alignment: identity.alignment,
      experiencePoints: identity.experiencePoints,
      age: identity.age,
    })
  },
)

async function saveIdentity() {
  if (!form.characterName.trim()) {
    emit('error', 'Укажите имя персонажа.')
    return
  }

  saving.value = true

  try {
    const identity = await updateCharacterIdentity(props.characterId, {
      characterName: form.characterName.trim(),
      playerName: form.playerName,
      classLevel: form.classLevel,
      race: form.race,
      background: form.background,
      alignment: form.alignment,
      experiencePoints: form.experiencePoints,
      age: form.age,
    })

    Object.assign(form, identity)
    emit('updated', identity)
    emit('saved', 'Изменения сохранены.')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить изменения.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="saveIdentity">
    <v-card max-width="700" class="pa-4">
      <v-card-title>Основная информация</v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.characterName"
              label="Имя персонажа"
              :rules="[(value: string) => !!value?.trim() || 'Укажите имя персонажа']"
              required
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field v-model="form.playerName" label="Имя игрока" />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field v-model="form.classLevel" label="Класс и уровень" />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field v-model="form.race" label="Раса" />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field v-model="form.background" label="Предыстория" />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field v-model="form.alignment" label="Мировоззрение" />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.experiencePoints"
              label="Опыт"
              type="number"
              min="0"
              max="9999999"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.age"
              label="Возраст"
              type="number"
              min="0"
              max="9999"
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" type="submit" :loading="saving" :disabled="saving">
          Сохранить изменения
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
