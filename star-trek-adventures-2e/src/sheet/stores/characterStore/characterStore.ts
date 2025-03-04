import { defineStore } from "pinia";
import { useMetaStore } from '@/sheet/stores/meta/metaStore'
import { reactive, ref, computed, type ComputedRef, type Reactive, type Ref, toRaw } from 'vue';

//

export type CharacterInfo = {
   name: string;
   pronouns: string;
   rank: string;
   assignment: string;
   role: string,
   reputation: string;
   species: string;
   traits: string;
   environment: string;
   upbringing: string;
   careerpath: string;
   experience: string;
   careerevent1: string;
   careerevent2: string;
   values: string[],
   focuses: string[],
   pastimes: string[],
}
export const useCharacterStore = defineStore('character', () => {
   const metaStore = useMetaStore();

   const characterRegistry:any ={

   }
   const character: Reactive<CharacterInfo> = reactive({
      name: "",
      pronouns: "",
      rank: "",
      assignment: "",
      role: "",
      reputation: "",
      species: "",
      traits: "",
      environment: "",
      upbringing: "",
      careerpath: "",
      experience: "",
      careerevent1: "",
      careerevent2: "",
      values: [],
      focuses: [],
      pastimes: [],
   } as const);


   const NAME = computed(() => character.name);
   const PRONOUNS = computed(() => character.pronouns);
   const RANK = computed(() => character.rank);
   const ASSIGNMENT = computed(() => character.assignment);
   const ROLE = computed(() => character.role);
   const REPUTATION = computed(() => character.reputation);
   const SPECIES = computed(() => character.species);
   const TRAITS = computed(() => character.traits);
   const ENVIRONMENT = computed(() => character.environment);
   const UPBRINGING = computed(() => character.upbringing);
   const CAREERPATH = computed(() => character.careerpath);
   const EXPERIENCE = computed(() => character.experience);
   const CAREEREVENT1 = computed(() => character.careerevent1);
   const CAREEREVENT2 = computed(() => character.careerevent2);

   type CharacterInfoEntry = {label:string,group:string,value:string};
   type OrderedCharacterInfo = Array<CharacterInfoEntry>;
   const charInfoOrdered:ComputedRef<OrderedCharacterInfo>= computed(() => {
      return ([
         /*name: character.info.name,
         pronouns: character.info.pronouns,
         rank: character.info.rank,
         assignment: character.info.assignment,
         role: character.info.role,
         reputation: character.info.reputation,
         species: character.info.species,
         traits:  character.info.traits,
         environment:  character.background.environment,
         upbringing:  character.background.upbringing,
         careerpath:  character.background.careerpath,
         experience:  character.background.experience,
         careerevent1:  character.background.careerevent1,
         careerevent2:  character.background.careerevent2, */
         {label: "name", group: "NAME", value: character.name,},
         {label: "pronouns", group: "PRONOUNS", value: character.pronouns,},
         {label: "rank", group: "RANK", value: character.rank,},
         {label: "assignment", group: "ASSIGNMENT", value: character.assignment,},
         {label: "role", group: "ROLE", value: character.role,},
         {label: "reputation", group: "REPUTATION", value: character.reputation,},
         {label: "species", group: "SPECIES", value: character.species,},
         {label: "traits", group: "TRAITS", value: character.traits,},
         {label: "environment", group: "ENVIRONMENT", value: character.environment,},
         {label: "upbringing", group: "UPBRINGING", value: character.upbringing,},
         {label: "career path", group: "CAREERPATH", value: character.careerpath,},
         {label: "experience", group: "EXPERIENCE", value: character.experience,},
         {label: "career event 1", group: "CAREEREVENT1", value: character.careerevent1,},
         {label: "career event 2", group: "CAREEREVENT2", value: character.careerevent2,},
      ]);
   });

   const addFocus = (value:string) => {
      character.focuses.push(value);
   }
   const listFocus = computed(() => {
      //return character.focuses;
      return ["Loyal","Astrophysics"]; 
   }); 

   // region Hydration
   const dehydrate = () => {
      console.log(`Dehydrate character: ${JSON.stringify({ character: { ...toRaw(character) } })}`);
      return toRaw(character);
   }
   const hydrate = (hydrateStore: CharacterInfo) => {
      console.log(`Hydrate character: ${JSON.stringify(hydrateStore)}`);
      //character.info = hydrateStore.character;
      //character.background = hydrateStore.background;
      //character.values = hydrateStore.values;
      //character.focuses = hydrateStore.focuses;
      //character.pastimes = hydrateStore.pastimes;

      Object.assign(character,hydrateStore);
   }

   return {
      character,
      charInfoOrdered,
      dehydrate,
      hydrate,
   }

});