<template>
   <label
      :key="label"
      class="info-section--info-card"
      :class="`info-section--info-card__${label}`"
   >
      <h5 class="field-header">{{ label }}</h5>
      <span 
         v-if="!editing" 
         class="field-value-view"
      >
         {{ value }}
      </span>
      <input 
         v-else  
         type="text"
         v-model="infoValue" 
         class="field-value-edit"
      />
   </label>
</template>

<script setup lang="ts">
   import { useUIStore } from '@/sheet/stores/uiStore/uiStore';
   import { CharacterInfo, useCharacterStore } from '@/sheet/stores/characterStore/characterStore'
   import { computed, type ComputedRef } from 'vue';
import { group } from 'console';

   const uiStore = useUIStore();
   const charStore = useCharacterStore();
   const props = defineProps({
      label: String,
      value: String,
   });
   const editing = computed({
      get: () => uiStore.editMode,
      set: (newValue) => uiStore.editMode = newValue 
   })
   const character = charStore.character; 

   const infoKey = props.label?.replace(/\s/g, "") as keyof typeof charStore.character; 
   const infoValue = computed({
      get() {
         return charStore.character[infoKey];
      },
      set(value: string & string[]) {
         charStore.character[infoKey] = value;
      }
   })

   //const charInfo = (props.group == 'info') ? charStore.character.info : charStore.character.background;

</script>

<style lang="scss">
   label.info-section--info-card {
      border: 1px solid #777;
      border-radius: 0.25rem;
      position: relative;
      grid-column: span 6;
      display: inline-flex;
      line-height: 1.5rem;
      min-height: 2rem;
      margin: 0.125rem;

      h5.field-header {
         position: absolute;
         margin: 0;
         top: 0.125rem;
         left: 0.225rem;
         color: var(--primary-text-color);
         font-size: 0.6rem;
         line-height: 0.6rem;
      }
      span.field-value-view {
         font-family: Arial, "Special Elite","Playpen Sans";
         text-transform: none;
         font-size: 0.85rem;
         text-align: center;
         width: 100%;
         margin: 0.125rem;
         margin-top: 0.5rem;
         line-height: 1.5rem;
         align-self: center;
         justify-self: center; 
      }
      input {
         font-family: Arial, "Special Elite","Playpen Sans";
         text-transform: none;
         text-align: center;
         width: 100%; 
         margin: 0.125rem;
         margin-top: 0.5rem;
         padding: 0;
         line-height: 1.5rem;
         border: 0;
         border-bottom: 1px dotted var(--primary-text-color);
         border-radius: 0.5rem;
         &:active, &:focus-within, &:focus-visible {
            outline: none;
            border: 0;
            border-bottom: 1px solid var(--primary-text-color);
         }
      }
   }
</style>