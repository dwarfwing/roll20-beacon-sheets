<template>
   <section
      class="info-section"
   >
      <InfoCard 
         v-for="infoObj in charStore.charInfoOrdered" 
         :key="infoObj.label"
         :label="infoObj.label" 
         :value="infoObj.value"
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
   import { useCharacterStore, type CharacterInfo } from '@/sheet/stores/characterStore/characterStore';
   import { computed, type ComputedRef } from 'vue';
   import InfoCard from './InfoView/InfoCard.vue'

   const uiStore = useUIStore();
   const charStore = useCharacterStore();

   const editMode = computed(() => { return uiStore.editMode; });

   //const character:CharacterType = charStore.character;
   //console.log(`Character in PC info: ${JSON.stringify(character)}`);

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
      

   }

</style>