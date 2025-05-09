// @ts-check

import Component, { html } from "../config/component.js";
import { css } from "../config/styles.js";

/**
 * ContainerTitle 은 string slot만 받습니다.
 */
class ContainerTitle extends Component {
  _validateSlot() {
    const slot = /** @type {HTMLSlotElement} */(this.shadowRoot.querySelector("slot"));
    const nodes = slot.assignedNodes();
    for (const node of nodes) {
      if (node.nodeType !== Node.TEXT_NODE) {
        throw new Error("Only text is allowed in app-container-title");
      }
    }
  }
  
  slotchangeHandler() {
    this._validateSlot();
  }

  render() {
    return html`
      <div>
        <i></i>
        <p>
          <slot @slotchange=${this.slotchangeHandler}></slot>
        </p>
      </div>
    `;
  }

  styles = css`
    div {
      padding: 26px 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      font-size: 18px;
      gap: .6em;
    }

    i {
      display: block;
      width: .9em;
      aspect-ratio: 1/1;
      border-radius: 999px;
      background-color: var(--blue);
    }

    p {
      padding-top: .1em;
    }
  `;
}

class ContainerContent extends Component {
  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }

  styles = css`
    div {
      padding: 18px;
      font-size: 16px;
    }
  `;
}

class ContainerFooter extends Component {
  render() {
    return html`
      <section>
        <app-divider></app-divider>
        <div>
          <slot></slot>
        </div>
      </section>
    `;
  }

  styles = css`
    div {
      padding: 20px 18px;
    }
  `;
}

class Container extends Component {
  render() {
    return html`
      <section>
        <slot></slot>  
      </section>
    `;
  }

  styles = css`
    section {
      width: 100%;
      height: 100%;
      box-shadow: 0px 4px 10px 2px rgba(0,0,0,0.1);
      border-radius: 16px;
      background-color: var(--soft-mist);
    }
  `;
}

customElements.define('app-container-title', ContainerTitle);
customElements.define('app-container-content', ContainerContent);
customElements.define('app-container-footer', ContainerFooter);
customElements.define('app-container', Container);
