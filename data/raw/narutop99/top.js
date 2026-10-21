import {LitElement, html, css} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';
import './_splash.js'
import './_hero.js';
import './_intro.js';
import './info/_info.js';
import './_vote.js';
import './_secret.js';
import './_special.js?r3';
import './_far.js'
import "./_campaign-modal.js"
import context from '../_context.js';
import specialVoting from '../_special-voting.js';
import './_midterm-report.js';
import './_countdown.js'

function scrollToHash() {
  if (location.hash) {
    if (location.hash == '#!special') {
      const $ = document.getElementById(`special-${context.specialVoting.current}`);
      if ($) {
        $.scrollIntoView()
      }
    }
  }
}

const $splash = document.querySelector('nv-splash')

if ($splash) $splash.addEventListener('end', scrollToHash);
window.addEventListener('hashchange', scrollToHash);
window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    document.body.classList.add('scrolled')
  } else {
    document.body.classList.remove('scrolled')
  }
})

const $bannerHost = document.getElementById('banner-host')
if ($bannerHost) {
  if (specialVoting.voted) {
    $bannerHost.classList.add('visible')
  }
  specialVoting.addEventListener('vote', () => {
    $bannerHost.classList.add('visible')
  })
}

class MovieModal extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    const close = () => {
      this.dispatchEvent(new CustomEvent('close'))
    }

    return html`
      <div class="movie-dialog -open" id="movie-modal">
        <div class="movie-bg" id="movie-modal-bg" @click=${close}></div>
        <div class="movie-inner">
          <div class="movie-btn-close hover-effect" id="movie-modal-close" @click=${close}></div>
          <iframe id="player1" class="youtube" width="700" height="394" src="https://www.youtube-nocookie.com/embed/O8czN6GUqHw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    `
  }
}

customElements.define('nv-movie-modal', MovieModal)

const myButtonOpen = document.getElementById('movie-modal-open');

if (myButtonOpen) {
  myButtonOpen.addEventListener('click', () => {
    document.body.classList.add('modal');
    const $modal = document.createElement('nv-movie-modal');
    $modal.addEventListener('close', () => {
      document.body.classList.remove('modal')
      document.body.removeChild($modal)
    })
    document.body.appendChild($modal);
  });
}


let targets = document.querySelectorAll('.movie-btn');

//スクロールイベント
window.addEventListener('scroll', function () {

  var scroll = window.scrollY; 
  var windowHeight = window.innerHeight; 

  for (let target of targets) { 
    var targetPos = target.getBoundingClientRect().top + scroll; 

    if (scroll > targetPos - windowHeight) { 
      target.classList.add('is-animated'); 
    }
  }

});

function resetHeight() {
  const h = window.innerHeight
  document.documentElement.setAttribute('data-v-height', h)
  document.documentElement.style.setProperty('--v-height', `${h}px`)
}

resetHeight()
window.addEventListener('resize', resetHeight)
