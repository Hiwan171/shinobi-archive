import all from './_ranking.all.gen.js';
import japan from './_ranking.japan.gen.js';
import asia from './_ranking.asia.gen.js';
import oceania from './_ranking.oceania.gen.js';
import northAmerica from './_ranking.north-america.gen.js';
import latinAmerica from './_ranking.latin-america.gen.js';
import europe from './_ranking.europe.gen.js';
import middleEast from './_ranking.middle-east.gen.js';
import africa from './_ranking.africa.gen.js';

import RankingArea from './_ranking-area.js';
import Characters from './_characters.js';
import { locale } from './_l10n.js'
import serifs from './_serifs.gen.js'

const rankingMap = {
  all,
  japan,
  asia,
  oceania,
  'north-america': northAmerica,
  'latin-america': latinAmerica,
  europe,
  'middle-east': middleEast,
  africa
}

const ranking = RankingArea.values.reduce((p, c) => {
  p[c] = rankingMap[c].map((r, i) => {
    const serif = serifs[r.character];
    return {...r, character: Characters.of(r.character), ...(serif ? {serif: serif[locale]} : {})}
  });
  return p;
}, {})

export default class Ranking {
  static byArea(area) {
    console.log(area)
    return ranking[area]
  }
}