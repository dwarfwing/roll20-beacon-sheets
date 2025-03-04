import { isAttributeKey, AttributesEnum, isDepartmentKey, type AttributeKey, type DepartmentKey, isDeterminationDice } from '@/system/gameTerms';
import { defineStore } from 'pinia';
import { computed, type ComputedRef, reactive, ref, toRaw } from 'vue';
import { useStatsStore } from '../statsStore/statsStore';
import { useGMStore } from '../gmStore/gmStore';
import { dispatchRef, initValues } from '@/relay/relay';
import { type Dispatch } from '@roll20-official/beacon-sdk';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { useMetaStore } from '../meta/metaStore';
import { rollEscape, rollUnescape } from '@/utility/rollEscape';

export type ActiveStats = {
  baseDice: number;
  attribute?: AttributeKey;
  department?: DepartmentKey;
  determinationDice: number;
  threatDice: number;
  momentumDice: number;
  focus: string;
  complicationRange: number;
};

export type PreparedRollStats = {
  attribute: AttributeKey;
  department: DepartmentKey;
} & ActiveStats;

/** Not exported from @roll20-official/beacon-sdk, overloading  */
export type RollReturnValue = {
    messageId: string;
    results: RollResults;
};
type RollResults = {
  [name: string]: {
      expression: string;
      rollName: string;
      results: {
          expression: string;
          result: number;
          rolls?: {
              sides: number;
              dice: number;
              results: number[];
          }[];
          dice?: number[];
      };
  };
};


// This corresponds to the data returned by Beacon when you ask it to roll dice for you.
// You may want to re-use this to simplify crafting your own templates.
export type DiceComponent = {
  /** The number of sides the die has */
  sides?: number;
  /** The number of dice with the amount of sides */
  count?: number;
  /** A string-based formula to roll, used instead of sides and count */
  rollFormula?: string;
  /** The label to show where this came from, primarily used for static bonuses */
  label?: string;
  /** The numerical value that is the number rolled on the dice, or the value of the bonus */
  value?: number;
  /** Indicates whether or not to always show this component in the breakdown, even if it's 0 */
  alwaysShowInBreakdown?: boolean;
};


type RollClass = 'critical-success' | 'determination' | 'complication' | 'success' | 'no-crit' | 'fail' | '';

/** Used by the rolltemplate to show each individual die */
type RollResult = {
  /** The actual result */
  roll: number;
  /** Whether the template should display the result as a crit-success/fumble */
  class: RollClass;
};

type RollParseContext = {
  dice?: number[];
  target: number;
  critRange: number;
  /**@Done @todo actually implement this */
  complicationRange?: number;
  determinationDice?: number;
};

type RollObject = {
  characterId: string,
  characterName: string,
  rollTitle: string,
  attribute: string,
  attributeLevel: number,
  department: string,
  departmentLevel: number,
  focusApplied: boolean,
  target: number,
  threatDice: number,
  momentumDice: number,
  critRange: number,
  complRange: number,
  determination: number,
  diceCount: number,
  rollStr: string,
  results: RollReturnValue,
  rollArguments: string,
  rollResult: RollResult[],
  successes: number,
  complications: number,
  reroll: number,
}

export const reRollAllExt = async (props: any, prevRoll:string) => {
  console.log(`Attempted a Reroll - functionality is work in progress! With props: ${JSON.stringify(props)}`);
  const dispatch: Dispatch = props.dispatch || (dispatchRef.value as Dispatch);
  console.log(`Previous roll as string: ${prevRoll}`);
  const previousRoll = rollUnescape(prevRoll);
  previousRoll.reroll++;
  //previousRoll.rollTitle = `Reroll{${previousRoll.reroll}}: ${previousRoll.rollTitle}`;
  console.log(`Previous roll: ${JSON.stringify(previousRoll)}`);
  
  /* const results = await dispatch.post({
    characterId: props.characterId,
    content: 'This is a reroll!', // &{template:default} {{name=Test Attack}} {{attack=[[1d20]]}} {{damage=[[2d6]]}}
   });
  console.log(`Reroll message ${props.messageId} and roll results ${JSON.stringify(results)}`); */

  executeRoll(previousRoll,dispatch);
};

const executeRoll = async (rollObj:RollObject,customDispatch?:Dispatch) => {
  const dispatch: Dispatch = customDispatch || dispatchRef.value;

  // Setup roll string and roll
  const { results } = await dispatch.roll({
    rolls: {
      roll: `${rollObj.diceCount}d20<${rollObj.target}cs<${1 + rollObj.critRange}`,
    },
  });
  console.log(`Roll results: ${JSON.stringify(results)}`);

  const { rollResult, successes, complications } = parseRollResults({ dice: results.roll.results.dice, critRange: rollObj.critRange, complicationRange: rollObj.complRange, target: rollObj.target, determinationDice: rollObj.determination });
  //console.log(`Roll result array: ${JSON.stringify(rollResult)}`)
  rollObj.rollResult = rollResult;
  rollObj.successes = successes;
  rollObj.complications = complications;

  // Create rolltemplate
  const bottomBarValues = [`${rollObj.diceCount}d20 ≤ ${rollObj.target}`, `Successes: ${rollObj.successes}`, `Complications: ${rollObj.complications}`];
  
  rollObj.rollArguments = rollEscape(`{rolltitle: '${rollObj.attribute} + ${rollObj.department}',characterName: '${rollObj.characterName}'}`);
  console.log(`Roll arguments: ${rollObj.rollArguments}`);
  console.log(`Roll results: ${JSON.stringify(results)}`);
  const content = createRollTemplate({
    type: 'roll',
    parameters: {
      characterId: rollObj.characterId,
      //...activeStats,
      rollTitle: rollObj.rollTitle,
      bottomBarValues,
      dice: results.roll.results.dice,
      critRange: rollObj.critRange,
      //complRange: complRange,
      rollResult: rollObj.rollResult,
      characterName: rollObj.characterName,
      arguments: rollObj.rollArguments,
      previousRoll: rollEscape(JSON.stringify(rollObj)),
      reroll: rollObj.reroll,
    },
  });
  // Post the rolltemplate to chat
  //console.log(`Roll content: ${JSON.stringify(content)}`);
  dispatch.post({
    characterId: rollObj.characterId,
    content,
  });
}

const checkPrepared = (stats: ActiveStats): stats is PreparedRollStats => {
  if (!(stats.attribute && stats.department)) return false;
  const isValid = isAttributeKey(stats.attribute) && isDepartmentKey(stats.department);
  if (!isValid) {
    console.error(`🖖 prepared stats not vaild: ${stats.attribute} or ${stats.department} incorrect`);
  }
  return isValid;
}; 


  /**
   * @param ctx The target number, whether a focus is applied, and
   * @returns the information needed to show numbers in the rolltemplate
   */
  const parseRollResults = (ctx: RollParseContext): { rollResult: RollResult[]; successes: number; complications: number } => {
    const { dice = [], target, critRange, complicationRange, determinationDice } = ctx;
    const results: RollResult[] = [];
    let successes = 0,
        complications = 0,
        determination = determinationDice || 0;
    dice.forEach((roll) => {
      console.log(`Roll: ${JSON.stringify(roll)}, Determination: ${JSON.stringify(determination)}, `)
      const rollSucceeded = roll <= target;
      const rollComplication = roll > (20 - Number(complicationRange));
      let critClass: RollClass;
      switch (true) {
        case determination > 0 :
          roll = 1;
          critClass = 'determination';
          successes = successes + 2;
          determination--;
          break;
        case roll === 1:
        case roll <= critRange && rollSucceeded:
          critClass = 'critical-success';
          successes = successes + 2;
          break;
        case roll <= target:
          critClass = 'success';
          successes++;
          break;
        case roll === 20:
        case rollComplication:
          critClass = 'complication';
          complications++;
          break;
        default:
          critClass = 'fail';
      }

      /* Replaced with logic in the switch cases
       if (rollSucceeded) {
        successes += critClass === 'critical-success' ? 2 : 1;
      } */

      results.push({
        roll: roll,
        class: critClass,
      });
    });
    console.log(`Roll results: ${JSON.stringify({
      rollResult: results,
      successes,
      complications
    })}`);

    return {
      rollResult: results,
      successes,
      complications
    };
  };

export const useRollStore = defineStore('roll', () => {
  const statsStore = useStatsStore();
  const metaStore = useMetaStore();
  const gmStore = useGMStore();
  const activeName = ref('');
  const activeStats = reactive<ActiveStats>({
    baseDice: 0,
    determinationDice: 0,
    threatDice: 0,
    momentumDice: 0,
    focus: '',
    complicationRange: 1,
  });
  const savedRolls = reactive<Map<string, ActiveStats>>(new Map());

  const prepared = computed(() => checkPrepared(activeStats));

  const targetNumber = computed(() => {
    if (!checkPrepared(activeStats)) {
      return 0;
    }
    const keys = [statsStore[activeStats.attribute], statsStore[activeStats.department]];
    return keys.reduce((total, stat) => (total += stat), 0);
  });

  const savedRollActive = computed(() => savedRolls.has(activeName.value) && JSON.stringify(activeStats) === JSON.stringify(savedRolls.get(activeName.value)));

  const saveRoll = () => {
    if (!prepared.value) return;
    savedRolls.set(activeName.value, { ...activeStats });
  };

  const clearActiveStats = () => {
    delete activeStats.attribute;
    delete activeStats.department;
    activeStats.baseDice = 0;
    activeStats.determinationDice = 0;
    activeStats.threatDice = 0;
    activeStats.momentumDice = 0;
    activeStats.focus = '';
    activeStats.complicationRange = 1;
  };

  const addFocus = async (focus: string) => {
    activeStats.focus = focus;
    console.log(`Added focus: ${activeStats.focus}`);
  };
  const addDie = async (type?: string) => {
    const base: number = activeStats.baseDice,
      determination: number = activeStats.determinationDice,
      threat: number = activeStats.threatDice,
      momentum: number = activeStats.momentumDice,
      availDetermination = statsStore.DETERMINATION,
      availMomentum = gmStore.resources.momentum;
    console.log(`Base: ${base}, determination: ${determination}, 
                threat: ${threat}, momentum: ${momentum}, 
                five? ${base + determination + threat + momentum < 5}`);
    if (base + threat + momentum < 5) {
      switch (type) {
        case 'determination': {
          console.log(`Adding determination die`);
          if (determination < availDetermination) activeStats.determinationDice--;
          else console.log(`Not enough determination dice`);
          break;
        }
        case 'momentum': {
          console.log(`Adding momentum die`);
          if (momentum < availMomentum) activeStats.momentumDice++;
          else console.log(`Not enough momentum dice`);
          break;
        }
        case 'threat': {
          console.log(`Adding threat die`);
          activeStats.threatDice++;
          break;
        }
        default: {
          if (isAttributeKey(String(type))) {
            console.log(`Adding attribute ${type}`);
            activeStats.attribute = type as AttributeKey;
            activeStats.baseDice = activeStats.department ? 2 : 1;
          }
          if (isDepartmentKey(String(type))) {
            console.log(`Adding department ${type}`);
            activeStats.department = type as DepartmentKey;
            activeStats.baseDice = activeStats.attribute ? 2 : 1;
          }
          console.log(`Adding another type of die`);
        }
      }
    }
  };
  
  const doRoll = async (previousRoll?:RollObject) => {
    if (!prepared.value) return;

    const rollObj:RollObject = previousRoll || {
      characterId: metaStore.id,
      characterName: metaStore.name,
      rollTitle: `${activeStats.attribute} + ${activeStats.department}`,
      attribute: `${activeStats.attribute}`,
      attributeLevel: activeStats.attribute ? statsStore[activeStats.attribute] : 0,
      department: `${activeStats.department}`,
      departmentLevel: activeStats.department ? statsStore[activeStats.department] : 0,
      focusApplied: activeStats.focus.length > 0,
      target: 0,
      threatDice: activeStats.threatDice,
      momentumDice: activeStats.momentumDice >= gmStore.resources.momentum ? activeStats.momentumDice : gmStore.resources.momentum,
      critRange: 0,
      complRange: activeStats.complicationRange,
      determination: (activeStats.determinationDice > Number(statsStore.DETERMINATION)) ? Number(statsStore.DETERMINATION) : activeStats.determinationDice,
      diceCount: activeStats.baseDice + activeStats.threatDice + activeStats.momentumDice,
      rollStr: "",
      results: {messageId:'',results:{}},
      rollArguments: "",
      rollResult: [],
      successes: 0,
      complications: 0,
      reroll: 0,
    };

    rollObj.target = rollObj.attributeLevel + rollObj.departmentLevel;
    rollObj.critRange = rollObj.focusApplied ? rollObj.departmentLevel : 1;



    // Reduce the Determination and Increase Threat
    statsStore.conditionsFields.DETERMINATION.base = statsStore.DETERMINATION - rollObj.determination;
    gmStore.resources.momentum = gmStore.resources.momentum - rollObj.momentumDice;
    gmStore.resources.threat = gmStore.resources.threat + rollObj.threatDice;

    executeRoll(rollObj);
  };


  const handleSavedRollClick = (clickedRollName: string) => {
    const clickedRoll = savedRolls.get(clickedRollName);
    if (activeName.value === clickedRollName && savedRollActive.value) {
      doRoll();
      return;
    }
    activeName.value = clickedRollName;
    Object.assign(activeStats, { ...clickedRoll });
  };

  const dehydrate = () => {
    const rolls: Record<string, ActiveStats> = {};
    for (const [name, roll] of savedRolls.entries()) {
      rolls[name] = roll;
    }
    return { rolls };
  };

  type RollHydrate = {
    rolls: Record<string, ActiveStats>;
  };

  const hydrate = (hydrateStore: RollHydrate) => {
    savedRolls.clear();
    for (const entry of Object.entries(hydrateStore.rolls)) {
      savedRolls.set(...entry);
    }
  };

  return {
    activeName,
    activeStats,
    savedRolls,
    savedRollActive,
    saveRoll,
    doRoll,
    addDie,
    addFocus,
    handleSavedRollClick,
    clearActiveStats,
    dehydrate,
    hydrate,
  };
});
