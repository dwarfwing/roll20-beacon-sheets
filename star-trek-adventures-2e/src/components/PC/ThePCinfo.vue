<template>
   <section
      v-for="[groupkey, group] in Object.entries(character)" 
      :key="groupkey"
      class="info-section"
      :class="`info-section--${groupkey}`"
   >
      <InfoCard 
         v-for="[infokey,infovalue] in Object.entries(group)" 
         :group="groupkey" 
         :info="infokey"
      />
      <!-- <label
         v-for="[infokey,infovalue] in Object.entries(group)"
         :key="infokey"
         class="info-section--info-field"
         :class="`info-section--info-field__${infokey}`"
      >
         <span class="field-header">{{ infokey }}</span>
         <span 
            v-if="!editMode" 
            class="field-value-view"
         >
            {{ infovalue }}
         </span>
         <input 
            v-else 
            v-model="character[groupkey][infokey]" 
            class="field-value-edit"
         />
      </label> -->

   </section>
</template>

<script setup lang="ts">
   import { useUIStore } from '@/sheet/stores/uiStore/uiStore';
   import { useCharacterStore, type CharacterType } from '@/sheet/stores/characterStore/characterStore';
   import { computed, type ComputedRef } from 'vue';
   import InfoCard from './InfoView/InfoCard.vue'

   const uiStore = useUIStore();
   const charStore = useCharacterStore();

   const editMode = computed(() => { return uiStore.editMode; });

   const character:CharacterType = charStore.character;
   console.log(`Character in PC info: ${JSON.stringify(character)}`);

</script>

<style lang="scss">

   @use "../../common/scss/vars";
   section.info-section:first-of-type {
      grid-template-rows: repeat(4,1fr);
   }
   section.info-section:nth-of-type(2) {
      grid-template-rows: repeat(3,1fr);
   }
   section.info-section {
      display: grid;
      grid-column: 1 / -1;
      width: 100%; 
      min-width: 100%;
      grid-template-columns: subgrid;
      margin: 0;
      margin-top: -2px;
      label {
         border: 1px solid #777;
         border-radius: 0.25rem;
         position: relative;
         grid-column: span 6;
         display: inline-flex;
         line-height: 1.5rem;
         min-height: 2rem;
         margin: 0.125rem;
         span.field-header {
            position: absolute;
            top: 0.225rem;
            left: 0.225rem;
            color: var(--primary-text-color);
            font-size: 0.75rem;
            line-height: 0.75rem;
         }
         span.field-value-view {
            text-align: center;
            width: 100%;
            margin: 0.125rem;
            margin-top: 0.5rem;
            line-height: 1.5rem;
            align-self: center;
            justify-self: center; 
         }
         input {
            text-align: center;
            width: 100%; 
            margin: 0.125rem;
            margin-top: 0.5rem;
            padding: 0;
            line-height: 1.5rem;
            border: 0;
            border-bottom: 1px dotted var(--primary-text-color);
         }
      }

   }

</style>