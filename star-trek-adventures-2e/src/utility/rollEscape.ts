
const chars = {
      '"': '%quot;',
      "'": '&apos;',
      ',': '%comma;',
      ':': '%colon;',
      '}': '%rcub;',
      '{': '%lcub;',
}
export const rollEscape = (str) => {
      str = (typeof(str) === 'object') ? JSON.stringify(str) : (typeof(str) === 'string') ? str : null;
      return (str) ? `${str}`.replace(new RegExp(`[${Object.keys(chars)}]`, 'g'), (r) => chars[r]) : null;
}
export const rollUnescape = (str) => {
      str = `${str}`.replace(new RegExp(`(${Object.values(chars).join('|')})`, 'g'), (r) => Object.entries(chars).find(e=>e[1]===r)[0]);
      return JSON.parse(str);
}
