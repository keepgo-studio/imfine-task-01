// @ts-check

import Component, { html } from "./config/component.js";
import { css } from "./config/styles.js";

const IS_LOCAL = window.location.protocol === 'file:';
/**
 * special component which handle routing
 * 
 * @typedef {Object} AppState
 * @property {string | null} route
 */
class App extends Component {
  /** @type {AppState} */
  state = {
    route: null
  };
  
  init() {
    this.state = {
      route: window.location.pathname 
    };

    if (IS_LOCAL) return;

    window.addEventListener('popstate', () => {
      this.setState({ route: window.location.pathname });
    });
  }

  /**
   * @param {string} path
   * @returns {void}
   */
  navigate(path) {
    window.history.pushState({}, '', path);
    this.setState({ route: path });
  }

  /** @override */
  render() {
    if (IS_LOCAL) {
      return html`<app-page-home></app-page-home>`;
    }

    const { route } = this.state;

    if (route === '/') {
      return html`<app-page-home></app-page-home>`;
    } else {
      return html`<app-page-not-found></app-page-not-found>`;
    }
  }

  styles = css`
    :host {
      --soft-mist: #F6F6F6;
      --stone-gray: #B8B8B8;
      --silver-dust: #DCDCDC;
      --blue: #2E4EFF;
      --black: #000;
      --white: #fff;
      --raspberry-punch: #FF3277;
      --amber-flame: #FEB40E;

      --screen-lg: 1280px;
      --screen-xl: 1480px;
      --screen-2xl: 1680px;

      font-family: Roboto;
    }
  `;
}

customElements.define('app-app', App);
