// @ts-check

import Component, { html } from "../config/component.js";
import { css } from "../config/styles.js";

export class Divider extends Component {
  render() {
    return html`
      <div></div>
    `;
  }

  styles = css`
    div {
      width: 100%;
      height: .5px;
      background-color: var(--silver-dust)
    }
  `;
}

customElements.define('app-divider', Divider);
