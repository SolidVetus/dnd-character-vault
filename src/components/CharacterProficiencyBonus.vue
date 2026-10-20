<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateProficiencyBonus } from '../api/characters'

interface Props {
  characterId: string
  proficiencyBonus: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [value: number]
  saved: [message: string]
  error: [message: string]
}>()

const proficiencyBonus = ref(props.proficiencyBonus)
const saving = ref(false)

watch(
  () => props.proficiencyBonus,
  (value) => {
    proficiencyBonus.value = value
  },
)

async function saveProficiencyBonus() {
  if (
    !Number.isInteger(proficiencyBonus.value) ||
    proficiencyBonus.value < 0 ||
    proficiencyBonus.value > 10
  ) {
    emit('error', 'Бонус мастерства должен быть целым числом от 0 до 10.')
    return
  }

  saving.value = true

  try {
    const result = await updateProficiencyBonus(props.characterId, proficiencyBonus.value)
    proficiencyBonus.value = result.value
    emit('updated', result.value)
    emit('saved', 'Бонус мастерства сохранён.')
  } catch (err) {
    emit(
      'error',

      err instanceof Error ? err.message : 'Не удалось сохранить бонус мастерства.',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="mb-6">
    <h2 class="text-h5 mb-3">Бонус мастерства</h2>

    <v-card variant="outlined" max-width="700" class="pa-4">
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="proficiencyBonus"
            label="Бонус мастерства"
            type="number"
            min="0"
            max="10"
            step="1"
          />

          <v-btn color="primary" :loading="saving" :disabled="saving" @click="saveProficiencyBonus">
            Сохранить
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </section>
</template>
