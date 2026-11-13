<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Character, CharacterSkill } from '@/types/character'
import CharacterSkillsDialog from './modal/CharacterSkillsDialog.vue'

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

const localSkills = ref<CharacterSkill[]>([])
const activeSkillId = ref<string | null>(null)

const activeSkill = computed(
  () => localSkills.value.find((skill) => skill.id === activeSkillId.value) ?? null,
)

const dialogOpen = computed({
  get: () => activeSkillId.value !== null,
  set: (open: boolean) => {
    if (!open) activeSkillId.value = null
  },
})

watch(
  () => props.skills,
  (skills) => {
    localSkills.value = skills.map((skill) => ({ ...skill }))
  },
  { immediate: true, deep: true },
)

function openSkillDialog(skillId: string) {
  activeSkillId.value = skillId
}

function handleUpdated(skill: CharacterSkill) {
  const index = localSkills.value.findIndex((item) => item.id === skill.id)

  if (index !== -1) {
    localSkills.value[index] = { ...skill }
  }

  emit('updated', skill)
}

function formatBonus(bonus: number | null): string {
  if (bonus === null) return '—'
  return bonus >= 0 ? `+${bonus}` : String(bonus)
}
</script>

<template>
  <section>
    <h2 class="character-skills__title">Навыки</h2>

    <v-card variant="outlined" max-width="700" class="character-skills__card">
      <v-list density="compact" class="character-skills__list">
        <v-list-item
          v-for="skill in localSkills"
          :key="skill.id"
          min-height="42"
          class="character-skills__item"
        >
          <template #prepend>
            <v-icon
              :icon="skill.proficient ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
              :aria-label="skill.proficient ? 'Есть владение' : 'Нет владения'"
              class="character-skills__proficiency-icon"
              :class="{ 'character-skills__proficiency-icon--proficient': skill.proficient }"
            />
          </template>

          <v-list-item-title
            class="character-skills__name"
            :class="{ 'character-skills__name--proficient': skill.proficient }"
          >
            {{ skill.name }} ({{ skill.ability.toUpperCase() }})
          </v-list-item-title>

          <template #append>
            <div class="character-skills__actions">
              <span class="character-skills__bonus">{{ formatBonus(skill.bonus) }}</span>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                class="character-skills__edit-button"
                :aria-label="`Редактировать навык: ${skill.name}`"
                @click="openSkillDialog(skill.id)"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <CharacterSkillsDialog
      v-if="activeSkill"
      :key="activeSkill.id"
      v-model="dialogOpen"
      :character-id="props.characterId"
      :skill="activeSkill"
      @updated="handleUpdated"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
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
  container-type: inline-size;
  overflow: hidden;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}

.character-skills__list {
  padding: 0;
  background: var(--page-surface);
  color: var(--text-color);
}

.character-skills__item {
  min-height: 42px;
  padding: 4px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--page-surface);
  color: var(--text-color);
  transition: background-color 0.15s ease;
}

.character-skills__item:last-child {
  border-bottom: 0;
}

.character-skills__item :deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 8px;
}

.character-skills__item:hover {
  background: var(--page-background);
}

.character-skills__proficiency-icon {
  color: var(--text-muted);
}

.character-skills__proficiency-icon--proficient {
  color: var(--accent-color);
}

.character-skills__name {
  color: var(--text-color);
  font-size: clamp(0.68rem, calc(0.22rem + 3.1cqi), 0.95rem);
  font-weight: 500;
}

.character-skills__name--proficient {
  color: var(--heading-color);
  font-weight: 800;
}

.character-skills__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.character-skills__bonus {
  min-width: 36px;
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
}

.character-skills__edit-button {
  color: var(--accent-color);
}

.character-skills__edit-button:hover {
  color: var(--button-hover-border);
}

.character-skills__edit-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}
</style>
