// @ts-check

import Component, { html, map } from "../config/component.js";
import { dataModel } from "../model/Data.js";
import { css } from "../config/styles.js";

/**
 * @typedef {{
 *  allData: Array<{ key: string; val: number; }>;
 *  allValueChanges: { [key: string]: number; };
 *  allDataRemove: { [key: string]: boolean };
 * }} State
 */

class DataTable extends Component {
  /**
   * @override
   * @description
   * allData: dataModel 로부터 받아온 데이터
   * 
   * allValueChangeds: 각 item의 value값을 저장하는 number record
   * 
   * allDataRemove: 각 item의 삭젱여부를 저장하는 boolean record
   * 
   * @type {State}
   */
  state = {
    allData: [],
    allValueChanges: {},
    allDataRemove: {}
  };

  init() {
    dataModel.subscribe((allData) => {
      this.setState({ 
        allData,
      });

      const tbody = this.query("tbody");

      if (tbody) {
        tbody.scrollTo({
          top: tbody.scrollHeight,
          left: 0,
          behavior: "smooth"
        });
      }
    });
  }

  resetAllValues() {
    this.setState({
      allValueChanges: {},
    });
  }

  resetAllRemove() {
    this.setState({
      allDataRemove: {}
    })
  }

  /** @param {Event} e */
  resetItem(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const key = target.dataset.key;

    if (!key) return;
    const { allValueChanges } = this.state;

    const { [key]: _, ...restChanges } = allValueChanges;
    
    this.setState({
      allValueChanges: restChanges,
    });
  }
  
  /** @param {Event} e */
  removeItem(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const key = target.dataset.key;
    
    if (!key) return;

    const { allDataRemove } = this.state;

    this.setState({
      allDataRemove: {
        ...allDataRemove,
        [key]: true,
      }
    });
  }

  applyAll() {
    const { allData, allValueChanges, allDataRemove } = this.state;

    const newData = allData.filter(item => !allDataRemove[item.key]).map(({ key, val })=> ({
      key,
      val: allValueChanges[key] !== undefined ? allValueChanges[key] : val
    }))

    dataModel.set(newData);

    this.setState({
      allValueChanges: {},
      allDataRemove: {}
    })
  }

  /** @param {Event} e */
  changeHandler(e) {
    const input = /** @type {HTMLInputElement} */ (e.target);
    const key = input.dataset.key;
    const value = input.value.trim();

    if (!key || isNaN(Number(value))) return;

    this.setState({
      allValueChanges: {
        ...this.state.allValueChanges,
        [key]: Number(value),
      },
    });
  }

  isValueChanged() {
    const { allData, allValueChanges } = this.state;

    return allData.some(({ key, val }) => {
      const isDiff = allValueChanges.hasOwnProperty(key) && allValueChanges[key] !== val;
      return isDiff;
    });
  }
  
  isRemoveChanged() {
    const { allData, allDataRemove } = this.state;
  
    return allData.some(({ key, val }) => {
      const isRemoved = allDataRemove[key];
      return isRemoved;
    });
  }

  render() {
    const { allData, allValueChanges, allDataRemove } = this.state;
    const valueChanged = this.isValueChanged();
    const removeChanged = this.isRemoveChanged();

    return html`
      <div>
        <div class="actions">
          ${valueChanged || removeChanged ? html`
            ${removeChanged ? html`<button @click=${this.resetAllRemove} class="reset-btn">Restore Removed</button>` : ""}
            ${valueChanged ? html`<button @click=${this.resetAllValues} class="reset-btn">Reset Values</button>` : ""}
            <button @click=${this.applyAll} class="apply-btn">Apply All</button>
            ` : html`<p>no change</p>`}
          </div>

        <div style="height: 12px"></div>

        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${allData.length > 0 ? map(allData, ({ key, val }) => {
                const currVal = allValueChanges[key] ?? val;
                const isChanged  = currVal !== val;

                if (allDataRemove[key]) return;

                return html`
                  <tr>
                    <td>${key}</td>
                    <td>
                      <input
                        class=${isChanged ? "changed" : ""}
                        data-key=${key}
                        value=${currVal}
                        type="number"
                        @change=${this.changeHandler}
                      />
                    </td>
                    <td>
                      ${isChanged ? html`
                        <button data-key=${key} @click=${this.resetItem} class="reset-btn">Reset</button>
                      ` : ""}
                      <button data-key=${key} @click=${this.removeItem} class="remove-btn">Remove</button>
                    </td>
                  </tr>
                `;
              }) : html`
                <tr>
                  <td style="grid-column: 1/4">No data available</td>
                </tr>
              `
            }
          </tbody>
        </table>
      </div>
    `;
  }

  styles = css`
    .actions {
      display: flex;
      align-items: center;
      justify-content: end;
      height: 40px;
      gap: 6px;
    }
    .actions p {
      font-size: 14px;
      color: var(--stone-gray);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border-top: 1px solid var(--silver-dust);
    }

    tbody {
      display: block;
      max-height: 360px;
      overflow-y: auto;
    }

    thead tr,
    tbody tr {
      display: grid;
      grid-template-columns: 120px 1fr 160px;
      gap: 8px;
    }
    
    th, td {
      padding: 12px 6px;
      text-align: center;   
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    th {
      font-weight: bold;
    }
    
    tr {
      border-bottom: 1px solid var(--silver-dust);
    }

    th:not(:last-child) {
      border-right: 1px solid var(--silver-dust);
    }

    tbody td:last-child {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 10px;
      cursor: pointer;
      background-color: var(--soft-mist);
    }
    input:hover,
    input:focus,
    input.changed { 
      box-shadow: inset 0 0 0 1px var(--stone-gray);
      background-color: var(--white);
    }
  `;
}

customElements.define('app-data-table', DataTable);
