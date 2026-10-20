<script setup lang="ts">
import { ref, watch } from 'vue'
import { updatePassivePerception } from '../api/characters'

interface Props {
  characterId: string
  passivePerception: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [value: number]
  saved: [message: string]
  error: [message: string]
}>()

const value = ref(props.passivePerception)
const saving = ref(false)

watch(
  () => props.passivePerception,
  (newValue) => {
    value.value = newValue
  },
)

async function savePassivePerception() {
  if (!Number.isInteger(value.value) || value.value < 0 || value.value > 99) {
    emit('error', 'Пассивная внимательность должна быть целым числом от 0 до 99.')
    return
  }

  saving.value = true

  try {
    const result = await updatePassivePerception(props.characterId, value.value)

    value.value = result.value
    emit('updated', result.value)
    emit('saved', 'Пассивная внимательность сохранена.')
  } catch (err) {
    emit(
      'error',
      err instanceof Error ? err.message : 'Не удалось сохранить пассивную внимательность.',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="mb-6">
    <h2 class="text-h5 mb-3">Пассивная внимательность</h2>

    <v-card variant="outlined" max-width="700" class="pa-4">
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="value"
            label="Пассивная внимательность"
            type="number"
            min="0"
            max="99"
            step="1"
          />

          <v-btn
            color="primary"
            :loading="saving"
            :disabled="saving"
            @click="savePassivePerception"
          >
            Сохранить
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </section>
</template>
