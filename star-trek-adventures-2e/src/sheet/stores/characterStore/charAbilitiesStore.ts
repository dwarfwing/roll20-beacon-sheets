import { defineStore } from "pinia";
import { useMetaStore } from '@/sheet/stores/meta/metaStore'
import { reactive, ref, computed, type Reactive, type Ref, toRaw } from 'vue';

export const useCharacterStore = defineStore('character', () => {

   const abilities:any = {
      abilities: {}
   }

   // region Hydration
      const dehydrate = () => {
         console.log(`Dehydrate character: ${JSON.stringify({ character: { ...toRaw(abilities) } })}`);
         return {
            abilities: { ...toRaw(abilities) },
         }
      };
      const hydrate = (hydrateStore: any) => {
         console.log(`Hydrate abilities: ${JSON.stringify(hydrateStore)}`);
         
         Object.assign(abilities,hydrateStore.character)
      }

});