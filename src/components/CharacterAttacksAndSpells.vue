<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import type { CharacterAttack } from '@/types/character'
import CharacterAttackDialog from './modal/CharacterAttackDialog.vue'

const props = defineProps<{
  characterId: string
  attacks: CharacterAttack[]
}>()

const emit = defineEmits<{
  'update:attacks': [attacks: CharacterAttack[]]
  saved: [message: string]
  error: [message: string]
}>()

const dialogOpen = ref(false)
const activeAttackId = ref<string | null>(null)
const { width } = useDisplay()
const activeAttack = computed(
  () => props.attacks.find((attack) => attack.id === activeAttackId.value) ?? null,
)

function openAddDialog() {
  activeAttackId.value = null
  dialogOpen.value = true
}

function openEditDialog(attack: CharacterAttack) {
  activeAttackId.value = attack.id
  dialogOpen.value = true
}

function handleCreated(attack: CharacterAttack) {
  emit('update:attacks', [...props.attacks, attack])
}

function handleUpdated(updatedAttack: CharacterAttack) {
  emit(
    'update:attacks',
    props.attacks.map((attack) => (attack.id === updatedAttack.id ? updatedAttack : attack)),
  )
}

function handleDeleted(attackId: string) {
  emit(
    'update:attacks',
    props.attacks.filter((attack) => attack.id !== attackId),
  )
}

function formatBonus(bonus: number | null): string {
  if (bonus === null) return '—'
  return bonus >= 0 ? `+${bonus}` : String(bonus)
}
</script>

<template>
  <section class="attacks-section-wrap">
    <h2 class="section-header">Атаки и заклинания</h2>

    <v-card class="attacks-section" variant="outlined">
      <v-card-text class="attacks-section__content">
        <div v-if="attacks.length > 0" class="attacks-table">
          <div class="table-header" aria-hidden="true">
            <span>Название</span>
            <span>Бонус атаки</span>
            <span>Урон/вид</span>
          </div>
          <v-tooltip
            text="Нажмите на атаку, чтобы редактировать"
            location="top"
            :disabled="width <= 760"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <article
                  v-for="attack in attacks"
                  :key="attack.id"
                  class="attack-row"
                  role="button"
                  tabindex="0"
                  :aria-label="`Редактировать атаку ${attack.name}`"
                  @click="openEditDialog(attack)"
                >
                  <strong class="attack-row__name">{{ attack.name }}</strong>
                  <span class="attack-row__bonus">{{ formatBonus(attack.attackBonus) }}</span>
                  <span class="attack-row__damage">{{ attack.damage }}</span>
                </article>
              </div>
            </template>
          </v-tooltip>
        </div>

        <p v-else class="empty-message">Пока нет атак.</p>
        <v-btn
          variant="flat"
          block
          class="attacks__add-button"
          prepend-icon="mdi-plus"
          @click="openAddDialog"
        >
          Добавить атаку/заклинание
        </v-btn>
      </v-card-text>
    </v-card>

    <CharacterAttackDialog
      v-if="dialogOpen"
      :key="activeAttackId ?? 'new-attack'"
      v-model="dialogOpen"
      :character-id="props.characterId"
      :attack="activeAttack"
      @created="handleCreated"
      @updated="handleUpdated"
      @deleted="handleDeleted"
      @saved="emit('saved', $event)"
      @error="emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.attacks-section-wrap {
  min-width: 0;
}

.section-header {
  display: block;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 2px solid var(--accent-color);
  background: transparent;
  color: var(--heading-color);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.attacks-section {
  width: 100%;
  min-width: 0;
  container: attacks-card / inline-size;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--page-surface);
  color: var(--text-color);
}

.attacks-section__content {
  min-width: 0;
  padding: 16px;
}

.attacks-table {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.table-header,
.attack-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 0;
}

.table-header {
  border-bottom: 1px solid var(--border-color);
  color: var(--accent-color);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
}

.table-header span {
  min-width: 0;
  padding: 8px 6px;
  overflow-wrap: anywhere;
}

.table-header span:nth-child(2),
.attack-row__bonus {
  text-align: center;
}

.attack-row {
  min-width: 0;
  border-bottom: 1px dashed var(--border-color);
  background: var(--page-background);
  color: var(--text-color);
  cursor: pointer;
  font-family: Georgia, 'Times New Roman', serif;
  transition: background-color 0.15s ease;
}

.attack-row:hover {
  background: color-mix(in srgb, var(--page-background) 78%, var(--accent-color));
}

.attack-row:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid var(--accent-color);
  outline-offset: -2px;
}

.attack-row__name,
.attack-row__bonus,
.attack-row__damage {
  display: block;
  min-width: 0;
  padding: 3px;
  overflow-wrap: anywhere;
  font-size: 0.92rem;
  line-height: 1.32;
}

.attack-row__name {
  color: var(--heading-color);
  font-weight: 700;
}

.attacks__add-button {
  min-height: 42px;
  margin-top: 14px;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-weight: 600;
}

.attacks__add-button:hover {
  border-color: var(--button-hover-border);
  background: var(--button-hover-background) !important;
}

.attacks__add-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.empty-message {
  margin: 0;
  padding: 16px 12px;
  color: var(--text-muted);
  text-align: center;
}

@container attacks-card (max-width: 700px) {
  .attacks-section__content {
    padding: 10px;
  }

  .table-header,
  .attack-row {
    grid-template-columns: minmax(0, 1.25fr) minmax(50px, 0.55fr) minmax(0, 1fr);
  }

  .table-header {
    font-size: 0.78rem;
  }

  .attack-row__name,
  .attack-row__bonus,
  .attack-row__damage {
    font-size: 0.82rem;
  }
}

@container attacks-card (max-width: 420px) {
  .attacks-section__content {
    padding: 1rem;
  }

  .table-header,
  .attack-row__bonus,
  .attack-row__name,
  .attack-row__damage {
    font-size: 0.72rem;
  }

  .table-header span,
  .attack-row__name,
  .attack-row__bonus,
  .attack-row__damage {
    padding: 3px;
  }

  .table-header,
  .attack-row {
    grid-template-columns: minmax(0, 1.1fr) minmax(44px, 0.48fr) minmax(0, 1fr);
  }
}
</style>
