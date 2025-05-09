// @ts-check

import { html, PageComponent } from "../config/component.js";

class NotFound extends PageComponent {
  /** @param {MouseEvent} e */
  clickHandler(e) {
    this.navigate("/");
  }
  
  render() {
    return html`
      <div>
        <p>404 - Page Not Found</p>
        <button on-click=${this.clickHandler}>go home</button>
      </div>
    `;
  }
}

customElements.define('app-page-not-found', NotFound);
