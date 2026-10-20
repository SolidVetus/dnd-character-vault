<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateCharacterSkill, type Character, type CharacterSkill } from '../api/characters'

interface Props {
  characterId: string
  skills: Character['skills']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [skill: CharacterSkill]
  saved: [message: string]
  error: [message: string]
}>()

const savingSkill = ref<string | null>(null)

const localSkills = ref<CharacterSkill[]>([])

watch(
  () => props.skills,
  (skills) => {
    localSkills.value = skills.map((skill) => ({ ...skill }))
  },
  { immediate: true, deep: true },
)

async function saveSkill(skill: CharacterSkill) {
  if (savingSkill.value !== null) return

  savingSkill.value = skill.id

  try {
    const updatedSkill = await updateCharacterSkill(props.characterId, skill.id, {
      proficient: skill.proficient,
      bonus: skill.bonus,
    })

    const index = localSkills.value.findIndex((item) => item.id === skill.id)

    if (index !== -1) {
      localSkills.value[index] = updatedSkill
    }

    emit('updated', updatedSkill)
    emit('saved', `Навык «${updatedSkill.name}»: изменения сохранены.`)
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Не удалось сохранить навык.')
  } finally {
    savingSkill.value = null
  }
}
</script>

<template>
  <section class="mb-6">
    <h2 class="text-h5 mb-3">Навыки</h2>

    <v-card variant="outlined" max-width="700">
      <v-list density="compact" class="py-1">
        <v-list-item v-for="skill in localSkills" :key="skill.id" min-height="42" class="px-3">
          <template #prepend>
            <v-btn
              :icon="skill.proficient ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
              variant="text"
              density="compact"
              size="small"
              :aria-label="skill.proficient ? 'Убрать владение' : 'Добавить владение'"
              @click="skill.proficient = !skill.proficient"
            />
          </template>

          <v-list-item-title
            >{{ skill.name }} ({{ skill.ability.toUpperCase() }})</v-list-item-title
          >

          <template #append>
            <div class="d-flex align-center ga-1">
              <v-text-field
                :model-value="skill.bonus ?? ''"
                :aria-label="`Дополнительный бонус: ${skill.name}`"
                type="number"
                min="-99"
                max="99"
                clearable
                density="compact"
                variant="plain"
                hide-details
                style="width: 70px"
                @update:model-value="
                  (value) => {
                    skill.bonus = value === '' || value === null ? null : Number(value)
                  }
                "
              />

              <v-btn
                icon="mdi-content-save"
                variant="text"
                size="small"
                :aria-label="`Сохранить навык: ${skill.name}`"
                :loading="savingSkill === skill.id"
                :disabled="savingSkill !== null"
                @click="saveSkill(skill)"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </section>
</template>
