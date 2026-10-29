<script setup lang="ts">
import CharacterSheet from '@/components/CharacterSheet.vue'

defineProps<{
  id: string
}>()
</script>

<template>
  <CharacterSheet :character-id="id" />
</template>
