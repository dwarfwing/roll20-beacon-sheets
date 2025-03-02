<template>
   <label
      :key="info"
      class="info-section--info-field"
      :class="`info-section--info-field__${info}`"
   >
      <span class="field-header">{{ info }}</span>
      <span 
         v-if="!editMode" 
         class="field-value-view"
      >
         {{ charInfo[info] }}
      </span>
      <input 
         v-else 
         v-model="charInfo[props.info]" 
         class="field-value-edit"
      />
   </label>
</template>

<script setup lang="ts">
   import { useUIStore } from '@/sheet/stores/uiStore/uiStore';
   import { useCharacterStore } from '@/sheet/stores/characterStore/characterStore'
   import { computed } from 'vue';

   const uiStore = useUIStore();
   const charStore = useCharacterStore();
   const props = defineProps({
      group: String,
      info: String,
   });

   const editMode = computed(() => { return uiStore.editMode; });

   const charInfo = (props.group == 'info') ? charStore.character.info : charStore.character.background;



</script>