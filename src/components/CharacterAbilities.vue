<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AbilityId, Character } from '@/types/character'
import CharacterAbilitiesDialog from './modal/CharacterAbilitiesDialog.vue'

interface Props {
  characterId: string
  abilities: Character['abilities']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [ability: AbilityId, value: { score: number; mod: number }]
  saved: [message: string]
  error: [message: string]
}>()

const abilityNames: Record<AbilityId, string> = {
  str: 'Сила',
  dex: 'Ловкость',
  con: 'Телосложение',
  int: 'Интеллект',
  wis: 'Мудрость',
  cha: 'Харизма',
}

const abilityIds = Object.keys(abilityNames) as AbilityId[]
const activeAbility = ref<AbilityId | null>(null)
const dialogOpen = computed({
  get: () => activeAbility.value !== null,
  set: (open: boolean) => {
    if (!open) activeAbility.value = null
  },
})

function openAbilityDialog(ability: AbilityId) {
  activeAbility.value = ability
}
</script>

<template>
  <section class="abilities-section">
    <h2 class="abilities-section__title">Характеристики</h2>

    <div class="abilities-list">
      <v-card v-for="ability in abilityIds" :key="ability" class="ability-card" variant="flat">
        <div class="ability-card__inner">
          <div class="ability-card__name">
            {{ abilityNames[ability] }}
          </div>

          <div class="ability-card__score">
            {{ props.abilities[ability].score }}
          </div>

          <div class="ability-card__modifier">
            {{
              props.abilities[ability].mod >= 0
                ? `+${props.abilities[ability].mod}`
                : props.abilities[ability].mod
            }}
          </div>

          <v-btn
            class="abilities__edit-button"
            size="small"
            variant="text"
            prepend-icon="mdi-pencil"
            @click="openAbilityDialog(ability)"
          >
            Редактировать
          </v-btn>
        </div>
      </v-card>
    </div>

    <CharacterAbilitiesDialog
      v-if="activeAbility"
      :key="activeAbility"
      v-model="dialogOpen"
      :character-id="props.characterId"
      :ability="activeAbility"
      :abilities="props.abilities"
      @updated="(ability, value) => emit('updated', ability, value)"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.abilities-section {
  margin-bottom: 24px;
  color: var(--text-color);
}

.abilities-section__title {
  display: block;
  margin: 0 0 20px;
  padding: 0 0 10px;
  border-bottom: 2px solid var(--accent-color);
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.abilities-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.ability-card {
  position: relative;
  width: 100%;
  min-height: 210px;
  padding: 7px;
  overflow: visible;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--page-surface);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.ability-card__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 194px;
  padding: 12px 14px 8px;
}

.ability-card__name {
  width: 100%;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--border-color);
  color: var(--heading-color);
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
}

.ability-card__score {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  min-height: 75px;
  color: var(--heading-color);
  font-size: 2.7rem;
  font-weight: 800;
  line-height: 1;
}

.ability-card__modifier {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 52px;
  margin-top: 4px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  background: var(--page-background);
  box-shadow: 0 2px 5px rgb(0 0 0 / 8%);
  color: var(--heading-color);
  font-size: 1.3rem;
  font-weight: 800;
  text-align: center;
}

.ability-card__modifier-label {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.abilities__edit-button {
  min-height: 38px;
  margin-top: 8px;
  padding: 8px 14px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
  letter-spacing: 0.017857em;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.abilities__edit-button :deep(.v-btn__content) {
  color: var(--button-text) !important;
}

.abilities__edit-button:hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.abilities__edit-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.abilities__edit-button:disabled {
  opacity: 0.55;
}

@media (max-width: 480px) {
  .ability-card {
    max-width: 320px;
  }
}
</style>
