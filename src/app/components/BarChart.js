// @ts-check

import Component, { html, map } from "../config/component.js";
import { css, styleMap } from "../config/styles.js";
import { delay, getColorByKey, range } from "../config/utils.js";


/**
 * @typedef {Array<{ key: string; val: number; }>} DataType
 * @typedef {{
 *  allData: DataType;
 *  colors: { [key: string]: string };
 *  maxValue: number;
 *  minValue: number;
 *  tickStep: number;
 *  tickCount: number;
 *  zeroTopRatio: number;
 * }} State
 */

class BarChart extends Component {
  /** 
   * @override
   * @type {State}
   */
  state = {
    allData: [],
    colors: {},
    maxValue: 0,
    minValue: 0,
    tickStep: 0,
    tickCount: 10,
    zeroTopRatio: 0,
  }

  init() {
    this.addEventListener("update-data", 
      /**
       * @param {CustomEvent<{ allData: DataType }>} e
       */
      (e) => {
      const { allData } = e.detail;

      const colors = {};
      allData.forEach(item => {
        if (!colors[item.key]) {
          colors[item.key] = getColorByKey(item.key);
        }
      });

      const { tickCount } = this.state;

      const actualMaxValue = Math.max(...allData.map((item) => item.val)) || 0;
      const maxValue = actualMaxValue < 0 ? 0 : actualMaxValue;
      const actualMinValue = Math.min(...allData.map((item) => item.val)) || 0;
      const minValue = actualMinValue > 0 ? 0 : actualMinValue;
      const totalLength = Math.abs(maxValue) + Math.abs(minValue);
      const zeroTopRatio = minValue === 0 ? 0 : Math.abs(minValue) / totalLength;
      const tickStep = Math.ceil(totalLength / tickCount);

      this.setState({ 
        allData, 
        colors,
        maxValue,
        minValue,
        tickStep,
        zeroTopRatio
      });
    });
  }

  /** @param {MouseEvent} e */
  mouseenterHandler(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const index = Number(target.dataset.index);
    const barElem = this.query(`.bar[data-index="${index}"]`);

    barElem?.classList.add("hover");
  }

  /** @param {MouseEvent} e */
  mouseleaveHandler(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const index = Number(target.dataset.index);
    const barElem = this.query(`.bar[data-index="${index}"]`);

    barElem?.classList.remove("hover");
  }

  render() {
    const { 
      allData, 
      colors,
      minValue,
      tickStep,
      tickCount
    } = this.state;

    return html`
      <div class="chart-container">
        <!-- Y-Axis -->
        <div class="y-axis">
          ${map(range(tickCount + 1), (_, index) => {
            const value = minValue + index * tickStep;
            return html`<div class="y-tick" data-index=${index}>${String(value)}</div>`;
          })}
        </div>

        <!-- Chart -->
        <div class="chart">
          ${map(allData, ({ key, val }, index) => {
            return html`
              <div class="bar-container">
                <div
                  class="bar"
                  data-index=${index}
                  style=${styleMap({
                    backgroundColor: colors[key],
                  })}
                >
                  <div class="label">${val}</div>
                </div>
              </div>
            `;
          })}
        </div>

        <!-- X-Axis -->
        <div class="x-axis">
          ${map(allData, ({ key }, index) => html`
            <p 
              data-index=${index} 
              @mouseover=${this.mouseenterHandler}
              @mouseout=${this.mouseleaveHandler}
            >${key}</p>
          `)}
        </div>
      </div>
    `;
  }

  afterRender() {
    const { 
      allData, 
      maxValue,
      minValue,
      tickCount,
      zeroTopRatio
    } = this.state;

    const allBars = this.queryAll(".bar");
    const barTop = `-${Math.ceil(zeroTopRatio * 100)}%`;
    const totalLength = Math.abs(maxValue) + Math.abs(minValue);

    allBars.forEach(async elem => {
      const barElem = /** @type {HTMLDivElement} */ (elem);
      const index = Number(barElem.dataset.index);
      const val = allData[index].val;
      const barHeight = `${Math.ceil(Math.abs(val) / totalLength * 100)}%`;
      const flip = val < 0 ? "translateY(100%)" : "";

      barElem.style.height = "0px";
      barElem.style.top = barTop;
      barElem.style.transform = flip;
      
      await delay(100 * index);
      
      barElem.style.transition = "ease 800ms";
      barElem.style.height = barHeight;

      await delay(800);

      barElem.style.transition = "";
    });

    const yAxis = /** @type {HTMLDivElement} */ this.query(".y-axis");
    const allYTicks = this.queryAll(".y-tick");

    const totalHeight = yAxis.clientHeight;
    const step = totalHeight / tickCount;
    allYTicks.forEach(async elem => {
      const tickElem = /** @type {HTMLDivElement} */ (elem);
      const index = Number(tickElem.dataset.index);

      tickElem.style.bottom = `${index * step}px`;
      tickElem.style.transform = "translateY(50%)";
    })
  }

  styles = css`
    .chart-container {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr auto;
      height: 100%;
      gap: 16px;
    }

    .y-axis {
      position: relative;
      height: 100%;
      font-size: 14px;
      color: #555;
      width: 40px;
      border-right: 1px solid #333;
    }

    .y-tick {
      position: absolute;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .y-tick::after {
      content: "";
      display: block;
      width: 10px;
      height: 1px;
      background-color: #333;
    }

    .chart {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      height: 100%;
      position: relative;
    }

    .bar-container {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
    }

    .bar {
      position: relative;
      width: 100%;
      border-radius: 10px;
      color: #000;
      font-weight: bold;
      transition: color 0.25s, background-color 0.3s;
    }
    .bar.hover {
      color: #fff;
      background-color: #333 !important;
    }

    .label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .x-axis {
      grid-column: 2/3;
      display: flex;
      gap: 10px;
      justify-content: space-between;
      padding: 0 4px;
      margin-top: 8px;
      border-top: 1px solid #333;
    }

    .x-axis p {
      flex: 1;
      text-align: center;
      font-size: 12px;
      color: #555;
      margin: 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 4px 2px;
      transition: color 0.25s, background-color 0.3s;
    }

    .x-axis p:hover {
      color: #fff;
      background-color: #333;
      border-radius: 4px;
    }
  `;
}

customElements.define('app-bar-chart', BarChart);
