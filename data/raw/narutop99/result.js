import { LitElement, html, css, unsafeHTML, nothing } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';
import "./_result-report.js"
import Ranking from '../_ranking.js'
import Village from '../_village.js'
import { shuffle } from '../_random.js'
import {locale} from "../_l10n.js"
import { clamp } from '../_math.js';
import './_confetti.js';
import './_globe.js'
import './generation-ranking/_generation-ranking.js'
import './_scroll.js'
import './_hero.js'

class RankingShelf extends LitElement {
  static properties = {
    ranking: {reflect: true}
  }

  static styles = css`
    :host {
      display: block;
    }
  `

  createRenderRoot() {
    return this
  }

  render() {
    const { ranking } = this

    const didChange = ev => {
      const phone = window.matchMedia('(max-width: 767px)').matches;
      const [, oldWindow] = this.ranking.split('/')
      const [, newWindow] = ev.target.value.split('/')

      this.ranking = ev.target.value 

      if (oldWindow != newWindow) {
        window.scrollTo({
          top: window.scrollY + document.getElementById('ranking').getBoundingClientRect().top + (phone ? -95 : 50),
          behavior: 'smooth'
        })
      }
    }

    return html`
      <nv-ranking-switch value=${ranking} @change=${didChange}></nv-ranking-switch>
      <div class="switch-content container active">
        <nv-ranking ranking="${ranking}"></nv-ranking>
      </div>
    `
  }
}

class RankingSwitch extends LitElement {
  static properties = {
    value: {}
  }

  createRenderRoot() {
    return this
  }

  render() {
    const { value } = this
    const [area, window] = value.split('/')

    const switchWindow = win => {
      this.value = `${area}/${win}`
      this.dispatchEvent(new CustomEvent('change'))
    }

    const switchArea = area => {
      this.value = `${area}/${window}`
      this.dispatchEvent(new CustomEvent('change'))
    }

    let best20Switch = html`<div>1~20<span class="small">位</span></div>`;
    switch(locale) {
      case "en" : best20Switch = html`<div><span class="number">1</span>st - <span class="number">20</span>th</div>`;
      break

      case "fr" : best20Switch = html`<div class="text-wrap"><span class="number">1</span>er<span class="hyphen">-</span> <br><span class="number">20</span>e place</div>`;
      break

      case "de" : best20Switch = html`<div>Plätze <span class="number">1-20</span></div>`;
      break
      case "es" : best20Switch = html`<div><span class="number">1.° a 20.°</span></div><div> lugar</div>`;
      break

      case "it" : best20Switch = html`<div><span class="number">1°-20°</span></div><div>posizione</div>`;
      break
    }

    let best99Switch = html`<div>21~99<span class="small">位</span></div>`;
    switch(locale) {
      case "en" : best99Switch = html`<div><span class="number">21</span>st - <span class="number">99</span>th</div>`;
      break

      case "fr" : best99Switch = html`<div class="text-wrap"><span class="number">21</span>e<span class="hyphen">-</span> <br><span class="number">99</span>e place</div>`;
      break

      case "de" : best99Switch = html`<div>Plätze <span class="number">21-99</span></div>`;
      break

      case "es" : best99Switch = html`<div><span class="number">21.° a 99.°</span></div><div> lugar</div>`;
      break

      case "it" : best99Switch = html`<div><span class="number">21°-99°</span></div><div>posizione</div>`;
      break
    }

    let over100Switch = html`<div>100~<span class="small">位</span></div>`;
    switch(locale) {
      case "en" : over100Switch = html`<div><span class="number">100</span>th</div><div>and below</div>`;
      break

      case "fr" : over100Switch = html`<div class="text-wrap"><span class="number">100</span>e <br>place et plus</div>`;
      break

      case "de" : over100Switch = html`<div>Plätze ab <span class="number">100</span></div>`;
      break

      case "es" : over100Switch = html`<div><span class="number">100.°</span></div><div> lugar o más</div>`;
      break

      case "it" : over100Switch = html`<div><span class="number">100°</span></div><div>posizione in poi</div>`;
      break
    }

    let all = "ALL";
    switch(locale) {
      case "en" : all = "ALL";
      break

      case "fr" : all = "TOUT";
      break

      case "de" : all = "ALLE";
      break

      case "es" : all = "TODO";
      break

      case "it" : all = "TUTTI";
      break
    }

    let japan = "日本";
    switch(locale) {
      case "en" : japan = "Japan";
      break

      case "fr" : japan = "Japon";
      break

      case "de" : japan = "Japan";
      break

      case "es" : japan = "Japón";
      break

      case "it" : japan = "Giappone";
      break
    }

    let asia = "アジア";
    switch(locale) {
      case "en" : asia = "Asia";
      break

      case "fr" : asia = "Asie";
      break

      case "de" : asia = "Asien";
      break

      case "es" : asia = "Asia";
      break

      case "it" : asia = "Asia";
      break
    }

    let oceania = "オセアニア";
    switch(locale) {
      case "en" : oceania = "Oceania";
      break

      case "fr" : oceania = "Océanie";
      break

      case "de" : oceania = "Ozeanien";
      break

      case "es" : oceania = "Oceanía";
      break

      case "it" : oceania = "Oceania";
      break
    }

    let northAmerica = "北米";
    switch(locale) {
      case "en" : northAmerica = html`North<br>America`;
      break

      case "fr" : northAmerica = html`Amérique<br>du Nord`;
      break

      case "de" : northAmerica = "Nordamerika";
      break

      case "es" : northAmerica = html`América<br>del Norte`;
      break

      case "it" : northAmerica = "Nord America";
      break
    }

    let centralSouthAmerica = "中南米";
    switch(locale) {
      case "en" : centralSouthAmerica = html`Central &<br>South America`;
      break

      case "fr" : centralSouthAmerica = html`Amérique centrale<br>et du Sud`;
      break

      case "de" : centralSouthAmerica = html`Mittel- und<br>Südamerika`;
      break

      case "es" : centralSouthAmerica = html`América Central<br>y del Sur`;
      break

      case "it" : centralSouthAmerica = html`Centro e<br>Sud America`;
      break
    }

    let europe = "欧州";
    switch(locale) {
      case "en" : europe = "Europe";
      break

      case "fr" : europe = "Europe";
      break

      case "de" : europe = "Europa";
      break

      case "es" : europe = "Europa";
      break

      case "it" : europe = "Europa";
      break
    }

    let middleEast = "中東";
    switch(locale) {
      case "en" : middleEast = "Middle East";
      break

      case "fr" : middleEast = "Moyen-Orient";
      break

      case "de" : middleEast = "Naher Osten";
      break

      case "es" : middleEast = "Medio Oriente";
      break

      case "it" : middleEast = "Medio Oriente";
      break
    }

    let africa = "アフリカ";
    switch(locale) {
      case "en" : africa = "Africa";
      break

      case "fr" : africa = "Afrique";
      break

      case "de" : africa = "Afrika";
      break

      case "es" : africa = "África";
      break

      case "it" : africa = "Africa";
      break
    }

    return html`
      <div class="ranking-wrap">
        <ul class="rank-switch-list">
          <li class="switch-item ${window == 'best20' ? 'active' : ''}" @click=${() => switchWindow('best20')}>${best20Switch}</li>
          <li class="switch-item ${window == 'best99' ? 'active' : ''}" @click=${() => switchWindow('best99')}>${best99Switch}</li>
          <li class="switch-item ${window == 'over100' ? 'active' : ''}" @click=${() => switchWindow('over100')}>${over100Switch}</li>
        </ul>
      </div>
      <div class="scroll-wrap">
        <ul class="switch-list">
          <li class="switch-item ${area == 'all' ? 'active' : ''}" @click=${() => switchArea('all') }>${all}</li>
          <li class="switch-item ${area == 'japan' ? 'active' : ''}" @click=${() => switchArea('japan') }>${japan}</li>
          <li class="switch-item ${area == 'asia' ? 'active' : ''}" @click=${() => switchArea('asia') }>${asia}</li>
          <li class="switch-item ${area == 'oceania' ? 'active' : ''}" @click=${() => switchArea('oceania') }>${oceania}</li>
          <li class="switch-item ${area == 'north-america' ? 'active' : ''}" @click=${() => switchArea('north-america') }>${northAmerica}</li>
          <li class="switch-item ${area == 'latin-america' ? 'active' : ''}" @click=${() => switchArea('latin-america') }>${centralSouthAmerica}</li>
          <li class="switch-item ${area == 'europe' ? 'active' : ''}" @click=${() => switchArea('europe') }>${europe}</li>
          <li class="switch-item ${area == 'middle-east' ? 'active' : ''}" @click=${() => switchArea('middle-east') }>${middleEast}</li>
          <li class="switch-item ${area == 'africa' ? 'active' : ''}" @click=${() => switchArea('africa') }>${africa}</li>
        </ul>
      </div>
    `
  }
}

class RankingElement extends LitElement {
  static properties = {
    ranking: {}
  }

  createRenderRoot() {
    return this
  }

  render() {
    const [area, window] = this.ranking.split('/')

    const item = (rank, theme, area) => {
      const vl = Village.getSlug(rank.character.village)
      const numberFormat = new Intl.NumberFormat('ja');
      const unit = (() => {
        switch (locale) {
          case 'it': return 'voti';
          case 'de': return 'stimmen';
          case 'es': return 'votos';
          default: return 'votes';
        }
      })();

      let href = "https://naruto-official.com/special/minato2023";
      switch(locale) {
        case "en" : href = "https://naruto-official.com/en/special/minato2023";
        break
  
        case "fr" : href = "https://naruto-official.com/fr/special/minato2023";
        break
  
        case "de" : href = "https://naruto-official.com/de/special/minato2023";
        break
  
        case "es" : href = "https://naruto-official.com/es/special/minato2023";
        break

        case "it" : href = "https://naruto-official.com/it/special/minato2023";
        break
      }
      
      if (theme == 'best10' || theme == 'best20') {
        return html`
          <li class="ranking-item ${area == 'all' ? 'has-badge' : ''}">
            <div class="character-image">
              <img class="image" src="${rank.character.image}">
            </div>
            <div class="character-set">
              <div class="famous">
                ${area == 'all' && rank.serif ? unsafeHTML(rank.serif.replace('\n', '<br>')) : ''}
              </div>
              <div class="character-set-wrap">
                <div class="name">${ rank.character.name }</div>
                ${vl == 'other' ? nothing : html`<img class="village" src="/img/village-icon/${vl}-wh.svg">`}
              </div>
              <div class="point"><span class="number">${ numberFormat.format(rank.score) }</span><span class="unit">${unit}</span></div>
              <a href=${href} class="comic-btn"></a>
            </div>
            <div class="rank"><span class="number">${ rank.rank }</span></div>
          </li>
        `
      } else if (theme == 'best99') {
        return html`
          <li class="ranking-item">
            <div class="rank"><span class="number">${ rank.rank }</span></div>
            <div class="character-image">
              <img class="image" src="${rank.character.thumb}">
            </div>
            <div class="character-set">
              <div class="character-set-wrap">
                <div class="name">${ rank.character.name }</div>
              </div>
              <div class="point">
                <span class="number">${ numberFormat.format(rank.score) }</span><span class="unit">votes</span>
              </div>
            </div>
          </li>
        `
      } else {
        return html`
          <li class="ranking-item">
            <div class="rank"><span class="number">${ rank.rank }</span></div>
            <div class="character-set">
              <img class="image" src="${rank.character.thumb}">
              <div class="character-set-wrap">
                <div class="name">${ rank.character.name }</div>
              </div>
            </div>
          </li>
        `
      }
    }

    switch (window) {
      case 'best20': return html`
        <ul class="ranking-list best10">${Ranking.byArea(area).slice(0, 10).map(rk => item(rk, 'best10', area))}</ul>
        <ul class="ranking-list best20">${Ranking.byArea(area).slice(10, 20).map(rk => item(rk, 'best20', area))}</ul>      
      `
      case 'best99': return html`
        <ul class="ranking-list best99">${Ranking.byArea(area).slice(20, 99).map(rk => item(rk, 'best99', area))}</ul>
      `
      case 'over100': return html`
        <ul class="ranking-list over100">${Ranking.byArea(area).slice(99).map(rk => item(rk, 'over100', area))}</ul>
      `
    }
  }
}

customElements.define('nv-ranking-shelf', RankingShelf)
customElements.define('nv-ranking-switch', RankingSwitch)
customElements.define('nv-ranking', RankingElement)

class DifferenceGraph extends LitElement {
  static properties = {
    from: {type: Number},
    to: {type: Number},
    autoplay: {}
  }

  static gradients = [
    '#FFF96C',
    '#FFE86C',
    '#FFDA66',
    '#FFCB2E',
    '#FFC414',
    '#FFB700',
    '#FFAE00',
    '#FF931E',
    '#FF7C1E'
  ]

  static styles = css`
    :host {
      display: block;
      width: calc(56.51px * var(--diff));
      height: calc(8px * var(--diff));
      position: relative;
    }

    .dasher {
      position: absolute;
      left: 0;
      bottom: 0;
      visibility: hidden;
    }

    .shadow-1 {
      opacity: 0.33;
    }

    .shadow-2 {
      opacity: 0.11;
    }

    .indicator {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column-reverse;
      font-family: var(--impact-font);
      font-size: 20px;
      line-height: 1;
      width: 36.7px;
      height: 36.7px;
      border-radius: 50%;
      background: black;
      position: absolute;
      visibility: hidden;
      color: white;
      box-sizing: border-box;
    }

    .indicator:lang(ja) {
      flex-direction: row;
    }

    .indicator:lang(es) {
      flex-direction: column;
      font-size: 18px;
    }

    .indicator:lang(it) {
      padding-top: 2px;
    }

    .indicator:lang(es) {
      padding-top: 4px;
    }

    .indicator:lang(es) .no::after {
      content: ".°";
      letter-spacing: -0.2em;
    }

    .indicator:lang(it) .no::after {
      content: "°";
      letter-spacing: -0.2em;
    }

    .step {
      transform: scaleY(0);
      transform-origin: bottom;
    }

    .from {
      left: -11.2px;
      bottom: 3px;
    }

    .unit {
      font-family: var(--impact-font);
      font-size: 10px;
      line-height: 1;
      position: relative;
      bottom: -1px;
    }

    .unit:lang(ja) {
      font-family: var(--comic-font);
      transform: scale(0.9);
      bottom: 2px;
    }

    .unit:lang(es) {
      font-size: 9px;
      bottom: 0;
    }

    .unit:lang(it) {
      font-size: 10px;
      transform: scale(0.9);
    }

    .to {
      right: -18.9px;
      bottom: calc(var(--diff) * 8px - 9px);
    }

    .jumper {
      position: absolute;
      right: calc(-18.9px + (36.7px - 30.605px) / 2);
      bottom: calc(var(--diff) * 8px - 9px + 36.7px + 1px);
      visibility: hidden;
    }

    :host([autoplay]) .dasher {
      visibility: visible;
      animation: dash calc((var(--diff) - 1) * 0.1s) forwards;
    }

    :host([autoplay]) .shadow-1 {
      animation: dash calc((var(--diff) - 1) * 0.1s) 0.05s forwards;
    }

    :host([autoplay]) .shadow-2 {
      animation: dash calc((var(--diff) - 1) * 0.1s) 0.1s forwards;
    }

    :host([autoplay]) .step {
      animation: step forwards calc((var(--diff) - 1) * 0.1s);
    }

    :host([autoplay]) .jumper {
      animation: jump alternate infinite 0.25s calc((var(--diff) - 1) * 0.1s);
    }

    :host([autoplay]) .indicator {
      visibility: visible;
    }

    @keyframes step {
      to {
        transform: none;
      }
    }

    @keyframes dash {
      from {
        transform: translate(10.715px, -8px)
      }

      to {
        visibility: hidden;
        transform: translate(calc(8.2375px + 56.51px * (var(--diff) - 1)), calc(-8px * (var(--diff))));
      }
    }

    @keyframes jump {
      from {
        visibility: visible;
      }
      
      to {
        transform: translateY(-10px);
      }
    }

    @media screen and (max-width: 740px) {
      :host {
        width: calc(19.91px * var(--diff));
      }
      
      .indicator:lang(ja) {
        font-size: 16px;
        width: 30px;
        height: 30px;
      }

      .indicator:lang(en),
      .indicator:lang(it),
      .indicator:lang(fr),
      .indicator:lang(de),
      .indicator:lang(es) {
        font-size: 16px;
        width: 36px;
        height: 36px;
      }

      .dasher {
        display: none;
      }
      
      .jumper {
        display: none;
      }
    }
  `

  play() {
    this.setAttribute('autoplay', 'autoplay');
  }

  render() {
    const {from, to} = this;
    const diff = from - to;

    let unit = "位";
    switch(locale) {
      case "en" : unit = "Rank";
      break

      case "fr" : unit = "Place";
      break

      case "it" : unit = "posizione";
      break

      case "de" : unit = "Platz";
      break

      case "es" : unit = "lugar";
      break
    }

    return html`
      ${Array.from(Array(diff).keys()).map(i => html`
        <div class="step" style="width: ${100 / diff}%; height: ${(i + 1) * 100 / diff}%; background: ${DifferenceGraph.gradients[i]}; position: absolute; left: ${i * 100 / diff}%; bottom: 0"></div>
      `)}
      <img class="shadow shadow-2 dasher" src="/result/potential-ranking/ninja-dash.svg" width="40.035" height="43.256" alt="">
      <img class="shadow shadow-1 dasher" src="/result/potential-ranking/ninja-dash.svg" width="40.035" height="43.256" alt="">
      <img class="dasher" src="/result/potential-ranking/ninja-dash.svg" width="40.035" height="43.256" alt="">
      <img class="jumper" src="/result/potential-ranking/ninja-jump.svg" width="30.605" height="36.643" alt="">
      <div class="indicator from"><span class="no">${from}</span><span class="unit">${unit}</span></div>
      <div class="indicator to"><span class="no">${to}</span><span class="unit">${unit}</span></div>
      <style>
        :host {
          --diff: ${diff};
        }
      </style>
    `
  }
}

class MobChart extends LitElement {
  static properties = {
    count: {type: Number},
    autoplay: {}
  };

  static styles = css`
    :host {
      display: block;
      position: relative;
    }
  `

  play() {
    this.setAttribute('autoplay', 'autoplay')
  }

  render() {
    const { count } = this;
    const layout = (count, order, animationOrder) => {
      const mobs = [];
      const w = 22.691;
      let pivot = 0;
      let consumed = 0;
      
      if (count % 2 == 1) {
        mobs.push(html`<img class="mob" src="/result/perfect-attendance-ranking/mob.svg" width="22.691" height="55.056" alt="" style=${`${order == 'front' ? 'bottom: 0;' : 'top: 0;'} --position: 0; --order: ${animationOrder[0]}`}>`)
        count--;
        consumed = 1;
      } else {
        pivot = 0.5;
        mobs.push(html`<img class="mob" src="/result/perfect-attendance-ranking/mob.svg" width="22.691" height="55.056" alt="" style=${`${order == 'front' ? 'bottom: 0;' : 'top: 0;'} --position: -0.5; --order: ${animationOrder[0]}`}>`)
        mobs.push(html`<img class="mob" src="/result/perfect-attendance-ranking/mob.svg" width="22.691" height="55.056" alt="" style=${`${order == 'front' ? 'bottom: 0;' : 'top: 0;'} --position: 0.5; --order: ${animationOrder[1]}`}>`)
        count -= 2;
        consumed = 2;
      }

      Array.from(Array(count).keys()).map(i => i + 1).map(n => {
        mobs.push(html`<img class="mob" src="/result/perfect-attendance-ranking/mob.svg" width="22.691" height="55.056" alt="" style=${`${order == 'front' ? 'bottom: 0;' : 'top: 0;'} --position: ${n % 2 == 1 ? -pivot - ((n - 1) / 2 + 1) : pivot + n / 2}; --order: ${animationOrder[consumed + n - 1]}`}>`)
      })

      return mobs;

    }

    const animationOrder = shuffle(Array.from(Array(count).keys()));

    return html`
      ${layout(Math.ceil(count / 2), 'back', animationOrder.slice(0, Math.ceil(count / 2)))}
      ${layout(Math.floor(count / 2), 'front', animationOrder.slice(Math.ceil(count / 2)))}
      <div class="smoke-pivot">
        <img class="smoke smoke-1" src="/result/perfect-attendance-ranking/smoke.svg" height="36" alt="">
        <img class="smoke smoke-2" src="/result/perfect-attendance-ranking/smoke.svg" height="36" alt="">
        <img class="smoke smoke-3" src="/result/perfect-attendance-ranking/smoke.svg" height="36" alt="">
        <img class="smoke smoke-4" src="/result/perfect-attendance-ranking/smoke.svg" height="36" alt="">
        <img class="smoke smoke-5" src="/result/perfect-attendance-ranking/smoke.svg" height="36" alt="">
      </div>
      <style>
        :host {
          width: calc(${Math.ceil(count / 2)} * var(--mob-width));
          height: 72px;

          --count: ${count};
          --mob-width: 22.691px;
        }

        .mob {
          position: absolute;
          width: var(--mob-width);
          height: auto;
          left: calc(var(--position) * var(--mob-width) * -1);
          right: calc(var(--position) * var(--mob-width));
          margin: auto;
          transform: scale(0);
        }

        .smoke-pivot {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 72px;
        }

        .smoke {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: auto;
          opacity: 0;
        }

        :host([autoplay]) .smoke-1 {
          animation: smoke 0.5s;
        }
    
        :host([autoplay]) .smoke-2 {
          animation: smoke 0.5s 0.07s;
        }
    
        :host([autoplay]) .smoke-3 {
          animation: smoke 0.5s 0.1s;
        }
    
        :host([autoplay]) .smoke-4 {
          animation: smoke 0.5s 0.17s;
        }
    
        :host([autoplay]) .smoke-5 {
          animation: smoke 0.5s 0.2s;
        }

        .smoke-2 {
          left: 21.6px;
          right: -21.6px;
          top: 17px;
          bottom: -17px;
        }
    
        .smoke-3 {
          left: -19.1px;
          right: 19.1px;
          top: -17.4px;
          bottom: 17.4px;
        }
    
        .smoke-5 {
          left: 24.9px;
          right: -24.9px;
          top: -17.6px;
          bottom: 17.6px;
        }
    
        .smoke-4 {
          left: -26.8px;
          right: 26.8px;
          top: 19.4px;
          bottom: -19.4px;
        }

        @keyframes smoke {
          from {
            transform: scale(0);
          }
    
          25% {
            opacity: 1;
          }
    
          50% {
            opacity: 1;
          }
    
          to {
            transform: scale(2);
          }
        }

        @keyframes mob {
          10% {
            transform: scale(1);
          }
        
          50% {
            transform: translateY(-15px);
          }
        
          to {
            transform: none;
          }
        }

        :host([autoplay]) .mob {
          animation: mob forwards 0.5s calc(0.25s + var(--order) * 0.1s);
        }
      </style>
    `
  }
}

customElements.define('difference-graph', DifferenceGraph)
customElements.define('mob-chart', MobChart)

const $sideMenu = document.querySelector('.js-side-menu')
const $menuSP = document.querySelector('#menu-sp')
const $narutop99Logo = document.querySelector('.narutop99-btn')

function $scrollTrigger() {
  const currentY = window.pageYOffset
  if ( currentY > 0 ) {
    $sideMenu.classList.remove('kv')
    $narutop99Logo.classList.remove('kv')
  } else {
    $sideMenu.classList.add('kv');
    $narutop99Logo.classList.add('kv');
  }
}

window.addEventListener("scroll", $scrollTrigger)

const $menuTrigger = document.querySelector('.js-menu-trigger')
const $menuText = document.querySelector('.js-menu-text')
const $menuItems = document.querySelectorAll('.js-menu-item')

function menuChenge() {
  $sideMenu.classList.toggle('active')

  if ($sideMenu.classList.contains('active')){
    $menuText.textContent = 'CLOSE'
  } else {
    $menuText.textContent = 'MENU'
  }
}

$menuTrigger.addEventListener("click", menuChenge)

for (let i = 0 ; i < $menuItems.length ; i++){
  $menuItems[i].addEventListener("click", function(){
    $sideMenu.classList.remove('active')
    $menuText.textContent = 'MENU'
  })
}

[$sideMenu, $menuSP].forEach($menu => {
  const $items = $menu.querySelectorAll('.menu-item');
  $items.forEach($ => {
    $.addEventListener('click', ev => {
      const phone = window.matchMedia('(max-width: 767px)').matches;
      ev.preventDefault();
      window.scrollTo({behavior: 'smooth', top: window.scrollY + document.querySelector($.getAttribute('href')).getBoundingClientRect().top + (phone ? -72 : 0)});
    })
  })
})

let currentPivot = 0;

window.addEventListener('scroll', () => {
  const sy = window.scrollY
  if (sy == 0) {
    delete document.body.dataset.scroll;
  } else {
    if (sy > currentPivot) {
      document.body.dataset.scroll = 'down';
    } else {
      document.body.dataset.scroll = 'up';
    }
  }
  currentPivot = sy;
})

const $hero = document.getElementById('hero')
const $topmost = document.getElementById('topmost')
const $typography = document.getElementById('typography')
$hero.style.position = 'sticky'
// $hero.style.top = `${window.innerHeight - $hero.getBoundingClientRect().height}px`;

window.addEventListener('scroll', () => {
  const t = clamp(1 - ($topmost.getBoundingClientRect().bottom - window.innerHeight) / (window.innerHeight / 4), 0, 1);
  $typography.style.setProperty('--time', t);
})

