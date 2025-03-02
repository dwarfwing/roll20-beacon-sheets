import { defineStore } from "pinia";
import { reactive, ref, computed, type Reactive, type Ref, toRaw } from 'vue';

export type CharacterInfo = {
   name: string;
   pronouns: string;
   rank: string;
   assignment: string;
   role: string,
   reputation: string;
   species: string;
   traits: string;
}
export type CharacterBackground = {
   environment: string;
   upbringing: string;
   careerpath: string;
   experience: string;
   careerevent1: string;
   careerevent2: string;
}
export type CharacterType = {
   info: CharacterInfo;
   background: CharacterBackground;
}
export const useCharacterStore = defineStore('character', () => {

   const character: Reactive<CharacterType> = reactive({
      info: {
         name: "",
         pronouns: "",
         rank: "",
         assignment: "",
         role: "",
         reputation: "",
         species: "",
         traits: "",
      },
      background: {
         environment: "",
         upbringing: "",
         careerpath: "",
         experience: "",
         careerevent1: "",
         careerevent2: "",
      }
   } as const);
   type CharacterOrdered = [
      [key:string]: any;
   ];
   const characterOrdered:CharacterOrdered = {

   }

   type CharacterHydrate = {
      character: CharacterType;
   }
   // region Hydration
   const dehydrate = () => {
      console.log(`Dehydrate character: ${JSON.stringify({ character: { ...toRaw(character) } })}`);
      return {
         info: { ...toRaw(character.info) },
         background: { ...toRaw(character.background) },
      }
   };
   const hydrate = (hydrateStore: CharacterType) => {
      console.log(`Hydrate character: ${JSON.stringify(hydrateStore)}`);
      character.info = hydrateStore.info;
      character.background = hydrateStore.background;
      //Object.assign(character,hydrateStore.character)
   }

   return {
      character,
      dehydrate,
      hydrate,
   }

});