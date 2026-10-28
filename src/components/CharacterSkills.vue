<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Character, CharacterSkill } from '@/types/character'
import { updateCharacterSkill } from '../api/character/abilities'

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
    <h2 class="character-skills__title">Навыки</h2>

    <v-card variant="outlined" max-width="700" class="character-skills__card">
      <v-list density="compact" class="character-skills__list py-1">
        <v-list-item
          v-for="skill in localSkills"
          :key="skill.id"
          min-height="42"
          class="character-skills__item px-3"
        >
          <template #prepend>
            <v-btn
              class="character-skills__proficiency-button"
              :icon="skill.proficient ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
              variant="text"
              density="compact"
              size="small"
              :aria-label="skill.proficient ? 'Убрать владение' : 'Добавить владение'"
              @click="skill.proficient = !skill.proficient"
            />
          </template>

          <v-list-item-title
            class="character-skills__name"
            :class="{ 'character-skills__name--proficient': skill.proficient }"
          >
            {{ skill.name }} ({{ skill.ability.toUpperCase() }})
          </v-list-item-title>

          <template #append>
            <div class="d-flex align-center ga-1">
              <input
                :value="skill.bonus == null ? '' : String(skill.bonus)"
                :aria-label="`Дополнительный бонус: ${skill.name}`"
                type="number"
                min="-99"
                max="99"
                class="character-skills__bonus-input"
                @input="
                  (event) => {
                    const value = (event.target as HTMLInputElement).value
                    const parsed = value === '' ? null : Number(value)
                    skill.bonus =
                      parsed === null || !Number.isFinite(parsed) ? null : Math.trunc(parsed)
                  }
                "
                @keydown.enter.prevent="saveSkill(skill)"
              />

              <v-btn
                class="character-skills__save-button"
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

<style scoped>
.character-skills__title {
  display: block;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 2px solid var(--accent-color);
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.character-skills__card {
  overflow: hidden;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}

.character-skills__list {
  padding-top: 4px;
  padding-bottom: 4px;
  background: var(--page-surface);
  color: var(--text-color);
}

.character-skills__item {
  min-height: 42px;
  background: var(--page-surface);
  color: var(--text-color);
  transition: background-color 0.15s ease;
}

.character-skills__item + .character-skills__item {
  border-top: 1px solid var(--border-color);
}

.character-skills__item:hover {
  background: var(--page-background);
}

.character-skills__proficiency-button,
.character-skills__save-button {
  color: var(--accent-color);
}

.character-skills__save-button:hover:not(:disabled),
.character-skills__proficiency-button:hover:not(:disabled) {
  color: var(--button-hover-border);
  background: var(--image-background);
}

.character-skills__name {
  margin-left: 8px;
  color: var(--text-color);
  font-weight: 400;
  transition:
    font-weight 120ms ease,
    color 120ms ease;
}

.character-skills__name--proficient {
  color: var(--heading-color);
  font-weight: 800;
}

.character-skills__bonus-input {
  box-sizing: border-box;
  display: block;
  width: 76px;
  min-width: 76px;
  height: 36px;
  padding: 0 6px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--page-background);
  color: var(--text-color);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  text-align: center;
  appearance: textfield;
  -moz-appearance: textfield;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.character-skills__bonus-input::-webkit-inner-spin-button,
.character-skills__bonus-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
}

.character-skills__bonus-input:hover {
  border-color: var(--card-hover-border);
}

.character-skills__bonus-input:focus-visible {
  border-color: var(--accent-color);
  outline: 2px solid var(--accent-color);
  outline-offset: 1px;
}

.character-skills__save-button:focus-visible,
.character-skills__proficiency-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.character-skills__bonus-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
