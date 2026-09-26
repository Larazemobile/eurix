#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
const match = html.match(/<script>([\s\S]*)<\/script>/);
if (!match) throw new Error('No se encontró el script de Eurix');

function element() {
  return {
    innerHTML: '', textContent: '', value: '', style: {}, parentNode: null,
    classList: { add() {}, toggle() {} },
    appendChild(child) { child.parentNode = this; },
    addEventListener() {}, removeChild() {}, querySelectorAll() { return []; }
  };
}
const elements = new Map();
const document = {
  body: element(),
  getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
  createElement: element,
  addEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
const saved = JSON.stringify({ name: 'Prueba', avatar: 0, onboarded: true, prefs: { sound: false } });
const context = {
  console, document,
  localStorage: { getItem() { return saved; }, setItem() {} },
  window: { scrollTo() {}, addEventListener() {}, AudioContext: null, webkitAudioContext: null },
  history: {}, setTimeout() {}, Date, Math
};
vm.createContext(context);
vm.runInContext(match[1], context);

const levels = ['facil', 'medio', 'dificil'];
const generators = ['genContar', 'genPagar', 'genVuelta'];
let checked = 0;
for (const generator of generators) {
  for (const level of levels) {
    for (let i = 0; i < 2000; i++) {
      const item = context[generator](level);
      if (item.opts.length !== 3) throw new Error(`${generator}/${level}: no hay 3 opciones`);
      if (new Set(item.opts).size !== 3) throw new Error(`${generator}/${level}: opciones repetidas`);
      if (item.a < 0 || item.a > 2 || !item.opts[item.a]) throw new Error(`${generator}/${level}: respuesta inválida`);
      if (!item.explain || !item.explain.includes('=')) throw new Error(`${generator}/${level}: falta explicación`);
      checked++;
    }
  }
}
console.log(`Eurix: ${checked} preguntas validadas correctamente`);
