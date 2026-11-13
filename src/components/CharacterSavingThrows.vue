<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AbilityId, Character, CharacterSavingThrow } from '@/types/character'
import CharacterSavingThrowsDialog from './modal/CharacterSavingThrowsDialog.vue'

interface Props {
  characterId: string
  savingThrows: Character['savingThrows']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [savingThrow: CharacterSavingThrow]
  error: [message: string]
  saved: [message: string]
}>()

const localSavingThrows = ref<Character['savingThrows']>([])
const activeAbility = ref<AbilityId | null>(null)

const activeSavingThrow = computed(
  () =>
    localSavingThrows.value.find((savingThrow) => savingThrow.ability === activeAbility.value) ??
    null,
)

const dialogOpen = computed({
  get: () => activeAbility.value !== null,
  set: (open: boolean) => {
    if (!open) activeAbility.value = null
  },
})

watch(
  () => props.savingThrows,
  (savingThrows) => {
    localSavingThrows.value = savingThrows.map((savingThrow) => ({ ...savingThrow }))
  },
  { immediate: true, deep: true },
)

function openSavingThrow(ability: AbilityId) {
  activeAbility.value = ability
}

function handleUpdated(savingThrow: CharacterSavingThrow) {
  const index = localSavingThrows.value.findIndex((item) => item.ability === savingThrow.ability)

  if (index !== -1) {
    localSavingThrows.value[index] = { ...savingThrow }
  }

  emit('updated', savingThrow)
}

function formatBonus(bonus: number | null): string {
  if (bonus === null) return '—'
  return bonus >= 0 ? `+${bonus}` : String(bonus)
}
</script>

<template>
  <section>
    <h2 class="saving-throws__title">Спасброски</h2>

    <v-card variant="outlined" max-width="700" class="saving-throws__card">
      <v-list density="compact" class="saving-throws__list">
        <v-list-item
          v-for="savingThrow in localSavingThrows"
          :key="savingThrow.ability"
          min-height="42"
          class="saving-throws__item"
        >
          <template #prepend>
            <v-icon
              :icon="savingThrow.proficient ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
              :aria-label="savingThrow.proficient ? 'Есть владение' : 'Нет владения'"
              class="saving-throws__proficiency-icon"
              :class="{ 'saving-throws__proficiency-icon--proficient': savingThrow.proficient }"
            />
          </template>

          <v-list-item-title
            class="saving-throws__name"
            :class="{ 'saving-throws__name--proficient': savingThrow.proficient }"
          >
            {{ savingThrow.name }} ({{ savingThrow.ability.toUpperCase() }})
          </v-list-item-title>

          <template #append>
            <div class="saving-throws__actions">
              <span class="saving-throws__bonus">{{ formatBonus(savingThrow.bonus) }}</span>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                class="saving-throws__edit-button"
                :aria-label="`Редактировать спасбросок: ${savingThrow.name}`"
                @click="openSavingThrow(savingThrow.ability)"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <CharacterSavingThrowsDialog
      v-if="activeSavingThrow"
      :key="activeSavingThrow.ability"
      v-model="dialogOpen"
      :character-id="props.characterId"
      :saving-throw="activeSavingThrow"
      @updated="handleUpdated"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.saving-throws__title {
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

.saving-throws__card {
  overflow: hidden;
  border-color: var(--border-color);
  border-radius: 10px;
  background: var(--page-surface);
  color: var(--text-color);
}

.saving-throws__list {
  padding: 0;
  background: var(--page-surface);
  color: var(--text-color);
}

.saving-throws__item {
  min-height: 42px;
  padding: 4px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--page-surface);
  color: var(--text-color);
  transition: background-color 0.15s ease;
}

.saving-throws__item:last-child {
  border-bottom: 0;
}

.saving-throws__item :deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 8px;
}

.saving-throws__item:hover {
  background: var(--page-background);
}

.saving-throws__proficiency-icon {
  color: var(--text-muted);
}

.saving-throws__proficiency-icon--proficient {
  color: var(--accent-color);
}

.saving-throws__name {
  color: var(--text-color);
  font-size: clamp(0.68rem, calc(0.22rem + 3.1cqi), 0.95rem);
  font-weight: 500;
}

.saving-throws__name--proficient {
  color: var(--heading-color);
  font-weight: 800;
}

.saving-throws__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.saving-throws__bonus {
  min-width: 36px;
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
}

.saving-throws__edit-button {
  color: var(--accent-color);
}

.saving-throws__edit-button:hover {
  color: var(--button-hover-border);
}

.saving-throws__edit-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}
</style>
