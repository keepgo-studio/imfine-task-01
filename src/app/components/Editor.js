// @ts-check

import Component, { html, map } from "../config/component.js";
import { dataModel } from "../model/Data.js";
import { css } from "../config/styles.js";

/**
 * @typedef {Object} InputField
 * @property {string} name
 * @property {any} type
 * @property {string} placeholder
 * @property {string} label
 * @property {boolean} required
 */
class Editor extends Component {
  /**
   * @type {InputField[]}
   */
  inputs= [
    {
      name: "id",
      type: "text",
      placeholder: "ID",
      label: "Id",
      required: false,
    },
    {
      name: "val",
      type: "number",
      placeholder: "VAL",
      label: "Value",
      required: true,
    },
  ];

  /**
  * @override
  * @type {{
  *   error: string | null;
  * }}
  */
  state = {
    error: null
  };

  /** @param {SubmitEvent} e */
  submitHandler(e) {
    e.preventDefault();

    const form = /** @type {HTMLFormElement} */ (e.target);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const id = /** @type {string} */ (data.id).trim();
    const val = parseInt(/** @type {string} */(data.val), 10);

    try {
      dataModel.add(id, val);
      this.setState({
        error: null
      });
    } catch (err) {
      this.setState({
        error: err instanceof Error ? err.message : "model error"
      });
    }
  }

  render() {
    return html`
      <section>
        <form @submit=${this.submitHandler}>
          ${map(this.inputs, ({ name, type, placeholder, label, required }) => html`
            <div class="${name}-container">
              <input
                name=${name}
                type=${type}
                placeholder=${placeholder}
                ?required=${required}
              />
              <div style="height: 4px"></div>
              <label>${label}</label>
            </div>
          `)}

          <button type="submit">Add</button>
        </form>

        ${this.state.error ? html`
          <div style="height:10px"></div>
          <p class="error">${this.state.error}</p>
        ` : ""}
      </section>
    `;
  }

  styles = css`
    form {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    div {
      display: flex;
      flex-direction: column-reverse
    }
    .id-container {
      width: 120px;
    }
    .val-container {
      flex: 1;
    }

    label {
      color: var(--black);
      font-size: 14px;
      padding: 0 4px;
    }

    input {
      width: 100%;
      background-color: var(--white);
      padding: 12px 16px;
      border-radius: 10px;
      border: solid var(--stone-gray) 1px;
    }

    input:required + div + label::after {
      content: " *";
      font-size: 16px;
      color: var(--raspberry-punch);
      font-weight: bold;
    }

    button {
      cursor: pointer;
      padding: 10px 16px;
      background-color: var(--blue);
      color: var(--white);
      font-size: 14px;
      font-weight: bold;
      border-radius: 10px;
    }

    .error {
      color: var(--raspberry-punch);
      font-size: 14px;
      padding: 0 6px;
    }
  `;
}

customElements.define('app-editor', Editor);
