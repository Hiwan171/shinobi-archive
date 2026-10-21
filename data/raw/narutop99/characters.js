import charsGen from './_chars.gen.js'
import context from './_context.js';
import { shuffle } from './_random.js'

function generateCharacterOrders() {
  const groups = ['principal', 'main', 'sub', 'mob'];
  const orders = groups.map(g => {
    return shuffle(chars.filter(c => c.group == g).map(c => c.id))
  });

  let res = [];
  
  for (;;) {
    const round = []

    for (let i = 0; i < 4; i++) {
      if (orders[i].length != 0) {
        round.push(orders[i].pop())
      }
    }

    if (round.length == 0) break;
    res = res.concat(shuffle(round))
  }
  
  return res;
}

const chars = charsGen.map(ch => {
  if (context.locale == 'ja') return ch
  return {...ch, ...ch.l10n.en}
})

export const characterOrders = generateCharacterOrders();

export default class Characters {
  static byId = chars.reduce((a, b) => {
    a[b.id] = b;
    return a;
  }, {});

  static of(id) {
    return this.byId[id];
  }

  static all() {
    return chars;
  }

  static sorted() {
    return chars.slice().sort((a, b) => a.kana < b.kana ? -1 : 1)
  }

  static ordered() {
    return characterOrders.map(c => this.of(c));
  }

  static findByTag(tag) {
    for (const c of chars) {
      if (tag == c.tag || tag == c.tag_en) {
        return c;
      }
    }
  }
}