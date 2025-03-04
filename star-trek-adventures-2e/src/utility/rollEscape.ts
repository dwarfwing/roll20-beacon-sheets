
const chars:{[key:string]:string} = {
      '"': '%quot;',
      "'": '&apos;',
      ',': '%comma;',
      ':': '%colon;',
      '}': '%rcub;',
      '{': '%lcub;',
}
export const rollEscape = (str:string) => {
      str = (typeof(str) === 'object') ? JSON.stringify(str) : (typeof(str) === 'string') ? str : '';
      return (str) ? `${str}`.replace(new RegExp(`[${Object.keys(chars)}]`, 'g'), (r) => chars[r]) : '';
}
export const rollUnescape = (str:string) => {
      str = `${str}`.replace(new RegExp(`(${Object.values(chars).join('|')})`, 'g'), (r) => {
            const obj = Object.entries(chars).find(e=>e[1]===r);
            if (obj != undefined) return obj[0]
            else return '';
      });             
      return JSON.parse(str);
}
