export interface CharacterPreview {
  id: string
  characterName: string
  avatarUrl: string | null
}

export type AbilityId = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface CharacterAbility {
  score: number
  mod: number
}

export interface CharacterSavingThrow {
  ability: AbilityId
  name: string
  en: string
  proficient: boolean
  bonus: number | null
}

export interface CharacterSkill {
  id: string
  name: string
  en: string
  ability: AbilityId
  proficient: boolean
  bonus: number | null
}

export interface CharacterAttack {
  id: string
  name: string
  attackBonus: number | null
  damage: string
  note: string | null
}

export interface EquipmentItem {
  id: string
  name: string
  quantity: number
  note?: string | null
}

export interface CharacterFeature {
  id: string
  name: string
  description: string
}

export interface SpellSlot {
  level: number
  total: number
  used: number
}

export interface CharacterSpell {
  name: string
  level: number
  note: string | null
}

export interface Character {
  id: string
  createdAt: string
  updatedAt: string

  identity: {
    characterName: string
    playerName: string
    classLevel: string
    race: string
    background: string
    alignment: string
    experiencePoints: number
    age: number | null
    notes: string[]
    avatarUrl: string | null
  }

  abilities: Record<AbilityId, CharacterAbility>
  proficiencyBonus: number
  inspiration: boolean
  passivePerception: number

  savingThrows: CharacterSavingThrow[]
  skills: CharacterSkill[]
  proficienciesAndLanguages: string[]

  combat: {
    armorClass: number
    initiative: number
    speed: number
    hitDice: string
    hp: {
      max: number
      current: number
      temp: number
    }
    deathSaves: {
      successes: number
      failures: number
    }
  }

  attacks: CharacterAttack[]

  equipment: {
    currency: {
      cp: number
      sp: number
      ep: number
      gp: number
      pp: number
    }
    items: EquipmentItem[]
  }

  personality: {
    traits: string
    ideals: string[]
    bonds: string[]
    flaws: string[]
  }

  features: CharacterFeature[]

  spellcasting: {
    ability: AbilityId | null
    saveDc: number | null
    attackBonus: number | null
    slots: SpellSlot[]
    cantrips: CharacterSpell[]
    spells: CharacterSpell[]
  }
}
