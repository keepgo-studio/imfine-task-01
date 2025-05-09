// @ts-check

import Component, { html } from "../config/component.js";
import { css } from "../config/styles.js";
import { dataModel } from "../model/Data.js";

/**
 * @typedef {Array<{ id: string; value: number; }>} DataType
 * @typedef {{
 *  allData: DataType;
 *  typedJson: string;
 *  rawJson: string;
 *  error: string | null;
 * }} State
 */

class RawEditor extends Component {
  /** 
   * @override
   * @type {State}
   */
  state = {
    allData: [],
    typedJson: "",
    rawJson: "",
    error: null
  };

  init() {
    dataModel.subscribe((allData) => {
      const rawJson = JSON.stringify(allData, null, 2);

      this.setState({
        allData,
        typedJson: rawJson,
        rawJson,
        error: null
      });

      const editor = this.query(".json-editor");

      if (editor) {
        editor.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      }
    });
  }

  reset() {
    const { rawJson } = this.state;

    this.setState({
      typedJson: rawJson,
      error: null
    });
  }

  /**
   * @param {SubmitEvent} e 
   */
  submitHandler(e) {
    e.preventDefault();

    const { typedJson, rawJson } = this.state;
    const jsonStr = typedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

    try {
      const parsedData = JSON.parse(jsonStr);
      dataModel.set(parsedData);
    } catch (error) {
      console.error(error);

      this.setState({
        error: `JSON 형식이 잘못되었습니다: ${error.message}`,
        typedJson: rawJson
      });
    }
  }

  /** @param {InputEvent} e */
  inputHandler(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const typedJson = target.textContent.trim();

    this.state.typedJson = typedJson;

    if (this.state.rawJson.replace(/\s+/g, "") === this.state.typedJson.replace(/\s+/g, "")) {
      this.query(".actions").classList.remove("changed")
    } else {
      this.query(".actions").classList.add("changed")
    }
  };

  /**
   * JSON 문자열에 대한 구문 강조 처리
   * @param {string} jsonString
   * @returns {string}
   */
  highlightJson(jsonString) {
    return jsonString
      .replace(/"([^"]+)"\s*:/g, `<span class="key">"$1"</span>:`)  // Key
      .replace(/:\s*"([^"]*)"/g, `: <span class="string">"$1"</span>`)  // String
      .replace(/:\s*(-?\d+(\.\d+)?)/g, `: <span class="number">$1</span>`);  // Number
  }

  render() {
    const { typedJson, error } = this.state;

    return html`
      <form @submit=${this.submitHandler}>
        <div class="actions">
          <button type="button" @click=${this.reset} class="reset-btn">Reset</button>
          <button class="apply-btn">Apply</button>
        </div>

        ${error ? html`<p class="error">${error}</p>` : ""}

        <pre 
          class="json-editor" 
          contenteditable="true"
          @input=${this.inputHandler}
        >${this.highlightJson(typedJson)}</pre>
      </form>
    `;
  }

  styles = css`
    .actions {
      display: flex;
      align-items: center;
      justify-content: end;
      height: 40px;
      gap: 6px;
      opacity: 0;
      pointer-events: none;
    }
    .actions.changed {
      opacity: 1;
      pointer-events: initial;
    }

    .error {
      color: var(--raspberry-punch);
      padding: 12px 0;
    }

    button {
      border-radius: 999px;
      padding: 7px 16px;
      color: var(--white);
      font-size: 14px;
      cursor: pointer;
    }

    .reset-btn {
      background-color: var(--black);
    }

    .remove-btn {
      background-color: var(--raspberry-punch);
    }
    .apply-btn {
      background-color: var(--blue);
    }

    .json-editor {
      width: 100%;
      max-height: 400px;
      overflow-y: auto;
      padding: 12px;
      border-radius: 12px;
      border: none;
      resize: vertical;
      font-family: monospace;
      font-size: 14px;
      background-color: #fff;
      box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.05);
      color: #333;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      outline: none;
    }

    .key {
      color: #10b981;
    }

    .string {
      color: var(--amber-flame);
    }

    .number {
      color: var(--blue);
    }
  `;
}

customElements.define('app-raw-editor', RawEditor);
