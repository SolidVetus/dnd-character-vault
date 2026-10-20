<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateProficienciesAndLanguages } from '../api/characters'

interface Props {
  characterId: string
  items: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [items: string[]]
  saved: [message: string]
  error: [message: string]
}>()

const text = ref(props.items.join('\n'))
const saving = ref(false)

watch(
  () => props.items,
  (newItems) => {
    text.value = newItems.join('\n')
  },
)

async function saveProficienciesAndLanguages() {
  saving.value = true

  try {
    const items = text.value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    const result = await updateProficienciesAndLanguages(props.characterId, items)

    text.value = result.join('\n')
    emit('updated', result)
    emit('saved', 'Владения и языки сохранены.')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить владения и языки.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="mb-6">
    <h2 class="text-h5 mb-3">Прочие владения и языки</h2>

    <v-card variant="outlined" max-width="700" class="pa-4">
      <v-textarea
        v-model="text"
        label="Владения и языки"
        hint="Каждое владение или язык указывай с новой строки."
        persistent-hint
        rows="5"
      />

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="saving"
          :disabled="saving"
          @click="saveProficienciesAndLanguages"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </section>
</template>
