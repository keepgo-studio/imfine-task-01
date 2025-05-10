// @ts-check

import Component, { html, map } from "../config/component.js";
import { css } from "../config/styles.js";
import { dataModel } from "../model/Data.js";

/**
 * @typedef {"bar" | "line"} SupportChartType
 * @typedef {{
 *  allData: Array<{ key: string; val: number; }>;
 *  currentTypeIndex: number;
 *  chartTypeList: SupportChartType[]
 * }} State
 */

class Graph extends Component {
  /** 
   * @override
   * @type {State}
   */
  state = {
    allData: [],
    currentTypeIndex: 0,
    chartTypeList: []
  }

  static get observedAttributes() {
    return ["chart-type-list"];
  }

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "chart-type-list" && oldValue !== newValue) {
      const chartTypeList = newValue ? newValue.split(",").map(type => type.trim()) : [];
      this.setState({ chartTypeList, currentTypeIndex: 0 });
    }
  }

  init() {
    dataModel.subscribe(allData => {
      this.setState({ allData });
    });
  }

  unsupportYetHTML() {
    return html`
      <div style="width: 100%; height: 100%; display: flex; align-items:center; justify-content: center; color:var(--raspberry-punch);">
        This chart is unspport yet
      </div>
    `;
  }

  renderChart() {
    const { chartTypeList, currentTypeIndex } = this.state;

    return map(chartTypeList, (chartType, index) => {
      if (index !== currentTypeIndex) return;

      switch (chartType) {
        case "bar": return html`<app-bar-chart class="chart"></app-bar-chart>`
        case "line": return this.unsupportYetHTML();
        default: return;
      }
    })
  }

  /** @param {Event} e */
  clickHandler(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const index = Number(target.dataset.index);

    this.setState({ currentTypeIndex: index });
  }

  render() {
    const { chartTypeList, currentTypeIndex } = this.state;

    return html`
      <section>
        <div class="container">
          ${this.renderChart()}
        </div>

        <div>
          <h4>Chart Types</h4>

          <div style="height: 12px"></div>

          <ul>
            ${map(chartTypeList, (chartType, index) => html`
              <li
                class="button reset-btn ${currentTypeIndex === index ? "" : "unselect"}"
                data-index=${index}
                @click=${this.clickHandler}
              >
                ${chartType}
              </li>
            `)}
          </ul>
        </div>
      </section>
    `;
  }

  afterRender() {
    const { allData } = this.state;

    const chartElem = this.query(".chart");
    
    if (chartElem) {
      chartElem.dispatchEvent(new CustomEvent("update-data", {
        detail: { allData }
      }))
    }
  }

  styles = css`
    section {
      background-color: var(--white);
      padding: 72px 48px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .container {
      height: 400px;
    }

    ul {
      display: flex;
      gap: 4px;
    }

    li {
      width: fit-content;
    }
    li.unselect {
      background-color: var(--stone-gray);
    }
  `;
}

customElements.define('app-graph', Graph);
