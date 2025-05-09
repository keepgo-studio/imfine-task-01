(() => {
  // src/app/config/styles.js
  function css(strings, ...values) {
    return strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
  }
  function styleMap(styles) {
    return Object.entries(styles).filter(([, value]) => value != null && value !== "").map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`).join("; ");
  }
  var resetStyles = css`
  * {
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    font: inherit
  }

  li {
    display: block;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }

  ::-webkit-scrollbar {
    width:  10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #b8b8b8;
    border-radius: 999px;
    background-clip: padding-box;
    border: 3px solid transparent;
    cursor: pointer;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 999px;
  }
`;
  var globalStyles = css`
  button, .button {
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
`;

  // src/app/config/component.js
  var EVENT_PREFIX = "@";
  var Component = class extends HTMLElement {
    /** @type {ShadowRoot} */
    shadowRoot;
    state = {};
    /** @private */
    _bubbleEvents = [
      "click",
      "submit",
      "input",
      "change",
      "keydown",
      "mouseover",
      "mouseout"
    ];
    /** @private */
    _captureEvents = [
      "focus",
      "blur",
      "scroll",
      "load",
      "unload",
      "slotchange"
    ];
    /**
     * Shadow DOM 내부에 HTML 템플릿을 생성합니다.
     * @private
     * @param {string} htmlString - 렌더링할 HTML 문자열
     * @returns {DocumentFragment} - 렌더링된 DocumentFragment
     */
    _createTemplate(htmlString) {
      const template = document.createElement("template");
      template.innerHTML = `
      <style>
        ${resetStyles}
        ${globalStyles}
        ${this.styles}
      </style>
      ${htmlString.trim()}
    `;
      return template.content;
    }
    /**
     * Shadow DOM에 컴포넌트를 렌더링합니다.
     * @private
     */
    _render() {
      const htmlString = this.render();
      const fragment = this._createTemplate(htmlString);
      this.shadowRoot.innerHTML = "";
      this.shadowRoot.appendChild(fragment);
    }
    /** @private */
    _rerender() {
      this._render();
      this.afterRender();
    }
    /**
     * 이벤트 핸들러를 처리합니다.
     * 이벤트 버블링, 캡쳐 기능을 이용해서 shadowRoot에서 처리
     * 
     * @private
     * @param {Event} event - 트리거된 이벤트 객체
     */
    _handleEvent(event) {
      const target = (
        /** @type {Element | null} */
        event.target
      );
      if (!target) {
        console.warn(`Cannot find target for event - ${event}`);
        return;
      }
      const methodName = target.getAttribute(`${EVENT_PREFIX}${event.type}`);
      if (methodName && typeof this[methodName] === "function") {
        try {
          this[methodName](event);
        } catch (error) {
          console.error(`Error in handler '${methodName}':`, error);
        }
      }
    }
    // -----------------
    // life cycle methods
    // 컴포넌트 생명주기와 관련된 methods
    constructor() {
      super();
      this.shadowRoot = this.attachShadow({ mode: "open" });
      this._handleEvent = this._handleEvent.bind(this);
    }
    connectedCallback() {
      this.init();
      for (const eventType of this._bubbleEvents) {
        this.shadowRoot.addEventListener(eventType, this._handleEvent);
      }
      for (const eventType of this._captureEvents) {
        this.shadowRoot.addEventListener(eventType, this._handleEvent, true);
      }
      this._render();
      this.afterRenderFirst();
    }
    disconnectedCallback() {
      this.afterDeleted();
      for (const eventType of this._bubbleEvents) {
        this.shadowRoot.removeEventListener(eventType, this._handleEvent);
      }
      for (const eventType of this._captureEvents) {
        this.shadowRoot.removeEventListener(eventType, this._handleEvent, true);
      }
    }
    // -----------------
    // nested methods
    // 각 컴포넌트에서 활용할 수 있는 methods
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this._rerender();
    }
    /**
     * 
     * @param {string} selector 
     * @returns {Element | null}
     */
    query(selector) {
      return this.shadowRoot.querySelector(selector);
    }
    /**
     * 
     * @param {string} selector 
     * @returns {Array<Element | null>}
     */
    queryAll(selector) {
      return [...this.shadowRoot.querySelectorAll(selector)];
    }
    // -----------------
    // override methods, attributes
    styles = css``;
    init() {
    }
    /**
     * 렌더링 로직을 정의합니다.
     * @returns {string} 렌더링할 HTML 문자열
     */
    render() {
      return html``;
    }
    /** 첫 렌더링 이후 호출됩니다. */
    afterRenderFirst() {
    }
    /** 매 렌더링 이후 호출됩니다. */
    afterRender() {
    }
    /** 컴포넌트가 DOM에서 제거될 때 호출됩니다. */
    afterDeleted() {
    }
  };
  var PageComponent = class extends Component {
    /**
     * 특정 path으로 이동
     * @param {string} path
     */
    navigate(path) {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };
  function html(strings, ...values) {
    let result = "";
    strings.forEach((string, index) => {
      const value = values[index];
      switch (typeof value) {
        case "boolean":
          if (value) {
            result += string.replace(/\?(\w+)=$/, "$1");
          } else {
            result += string.replace(/\?(\w+)=$/, "");
          }
          break;
        case "function":
          if (!value.name) {
            throw new Error("Anonymous functions are not supported. Use named functions.");
          } else {
            result += string + value.name;
          }
          break;
        default:
          if (/=\s*$/.test(string)) {
            if (!/^".*"$/.test(`${value}`)) {
              result += string + `"${value}"`;
            } else {
              result += string + value;
            }
          } else {
            result += string + (value || "");
          }
      }
    });
    return result.replace(/@(\w+)="(.*?)"/g, `${EVENT_PREFIX}$1="$2"`);
  }
  function map(arr, callback) {
    return arr.map(callback).join("");
  }

  // src/app/config/utils.js
  function range(start, end, step = 1) {
    if (end === void 0) {
      end = start;
      start = 0;
    }
    if (start > end && step > 0) {
      step = -step;
    }
    if (step === 0) {
      throw new Error("Step cannot be zero.");
    }
    const result = [];
    const direction = step > 0 ? 1 : -1;
    for (let i = start; direction > 0 ? i < end : i > end; i += step) {
      result.push(i);
    }
    return result;
  }
  var colorPalette = [
    "#FF6B6B",
    "#FF8E72",
    "#FFA94D",
    "#FFC300",
    "#FFD700",
    "#FFF700",
    "#A7F432",
    "#32CD32",
    "#00FA9A",
    "#00CED1",
    "#00BFFF",
    "#1E90FF",
    "#4169E1",
    "#6A5ACD",
    "#8A2BE2",
    "#9400D3",
    "#9932CC",
    "#C71585",
    "#FF1493",
    "#FF69B4",
    "#FF6EB4",
    "#FF83FA",
    "#FFA07A",
    "#FF4500"
  ];
  function getColorByKey(key) {
    const index = Math.abs(
      [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colorPalette.length;
    return colorPalette[index];
  }
  function delay(ms = 1e3) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // src/app/components/BarChart.js
  var BarChart = class extends Component {
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
      zeroTopRatio: 0
    };
    init() {
      this.addEventListener(
        "update-data",
        /**
         * @param {CustomEvent<{ allData: DataType }>} e
         */
        (e) => {
          const { allData } = e.detail;
          const colors = {};
          allData.forEach((item) => {
            if (!colors[item.key]) {
              colors[item.key] = getColorByKey(item.key);
            }
          });
          const actualMaxValue = Math.max(...allData.map((item) => item.val)) || 0;
          const maxValue = actualMaxValue < 0 ? 0 : actualMaxValue;
          const actualMinValue = Math.min(...allData.map((item) => item.val)) || 0;
          const minValue = actualMinValue > 0 ? 0 : actualMinValue;
          const totalLength = Math.abs(maxValue) + Math.abs(minValue);
          const zeroTopRatio = minValue === 0 ? 0 : Math.abs(minValue) / totalLength;
          const tickStep = Math.ceil(totalLength / 10);
          this.setState({
            allData,
            colors,
            maxValue,
            minValue,
            tickStep,
            zeroTopRatio
          });
        }
      );
    }
    /** @param {MouseEvent} e */
    mouseenterHandler(e) {
      const target = (
        /** @type {HTMLElement} */
        e.target
      );
      const index = Number(target.dataset.index);
      const barElem = this.query(`.bar[data-index="${index}"]`);
      barElem?.classList.add("hover");
    }
    /** @param {MouseEvent} e */
    mouseleaveHandler(e) {
      const target = (
        /** @type {HTMLElement} */
        e.target
      );
      const index = Number(target.dataset.index);
      const barElem = this.query(`.bar[data-index="${index}"]`);
      barElem?.classList.remove("hover");
    }
    render() {
      const {
        allData,
        colors,
        minValue,
        tickStep
      } = this.state;
      const tickCount = 10;
      return html`
      <div class="chart-container">
        <!-- Y-Axis -->
        <div class="y-axis">
          ${map(range(tickCount + 1), (_, i) => {
        const value = minValue + i * tickStep;
        return html`<div class="y-tick">${String(value)}</div>`;
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
          backgroundColor: colors[key]
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
        zeroTopRatio
      } = this.state;
      const allBars = this.queryAll(".bar");
      const barTop = `-${Math.ceil(zeroTopRatio * 100)}%`;
      const totalLength = Math.abs(maxValue) + Math.abs(minValue);
      allBars.forEach(async (elem) => {
        const barElem = (
          /** @type {HTMLDivElement} */
          elem
        );
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
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-end;
      justify-content: space-between;
      height: 100%;
      font-size: 14px;
      color: #555;
      width: 40px;
      border-right: 1px solid #333;
    }

    .y-tick {
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
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: bold;
      transition: color 0.25s, background-color 0.3s;
    }
    .bar.hover {
      color: #fff;
      background-color: #333 !important;
    }

    .x-axis {
      grid-column: 2/3;
      display: flex;
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
  };
  customElements.define("app-bar-chart", BarChart);

  // src/app/components/Container.js
  var ContainerTitle = class extends Component {
    _validateSlot() {
      const slot = (
        /** @type {HTMLSlotElement} */
        this.shadowRoot.querySelector("slot")
      );
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
  };
  var ContainerContent = class extends Component {
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
  };
  var ContainerFooter = class extends Component {
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
  };
  var Container = class extends Component {
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
  };
  customElements.define("app-container-title", ContainerTitle);
  customElements.define("app-container-content", ContainerContent);
  customElements.define("app-container-footer", ContainerFooter);
  customElements.define("app-container", Container);

  // src/app/model/Data.js
  var DataModel = class {
    /** 
     * @private
     * @type {DataType}
     */
    _data = [];
    /** @private */
    _increment = 0;
    /** 
     * @private
     * @type {Set<function>}
    */
    _subscribers = /* @__PURE__ */ new Set();
    /** @private */
    _batching = false;
    constructor() {
      this._data = new Proxy(this._data, {
        set: (target, key, value) => {
          target[key] = value;
          if (!this._batching) {
            this._notify();
          }
          return true;
        }
      });
    }
    /** @private */
    _notify() {
      for (const callback of this._subscribers) {
        callback(this.getAll());
      }
    }
    /**
     * @private 
     * @param {Function} fn 
     */
    _batch(fn) {
      this._batching = true;
      try {
        fn();
      } finally {
        this._batching = false;
        this._notify();
      }
    }
    /**
     * @private
     * @param {string} key
     * @returns {boolean}
     */
    _isValidKey(key) {
      return typeof key === "string" && key.trim().length > 0;
    }
    /** 
     * @private 
     * @param {string} key
     */
    _findIndex(key) {
      return this._data.findIndex((item) => item.key === key);
    }
    /**
     * @param {string} key
     * @param {number} val
     */
    add(key, val) {
      const index = this._findIndex(key);
      if (index !== -1) {
        throw new Error(`Cannot add "${key}", exist key`);
      }
      this._data.push({
        key: key ? key : String(this._increment),
        val
      });
      this._increment++;
    }
    /** @param {string} key */
    remove(key) {
      const index = this._findIndex(key);
      if (index === -1) {
        throw new Error("Cannot remove, unknown key");
      }
      this._data.splice(index, 1);
    }
    /**
     * @param {string} key
     * @param {number} val
     */
    update(key, val) {
      const index = this._findIndex(key);
      if (index === -1) {
        throw new Error("Cannot update, unknown key");
      }
      this._data[index] = { key, val };
    }
    /**
     * @param {DataType} newData
     */
    set(newData) {
      this._batch(() => {
        const uniqueKeys = /* @__PURE__ */ new Set();
        newData.forEach((newItem) => {
          const { key, val, ...rest } = newItem;
          if (!this._isValidKey(key)) {
            throw new Error(`Invalid key "${key}". Keys must be non-empty strings.`);
          }
          if (uniqueKeys.has(key)) {
            throw new Error(`Duplicate key "${key}" is not allowed.`);
          }
          if (typeof val !== "number" || isNaN(val)) {
            throw new Error(`Invalid value for item(key"${key}") - "val" must be a number.`);
          }
          const extraFields = Object.keys(rest);
          if (extraFields.length > 0) {
            throw new Error(`Invalid fields for item(key"${key}") - ${extraFields.map((restKey) => `{ "${restKey}" : ${rest[restKey]} }`).join(", ")}`);
          }
          uniqueKeys.add(key);
        });
        this._data.splice(0, this._data.length, ...newData);
      });
    }
    /**
     * @param {string} key
     * @returns {KeyValuePair | undefined}
     */
    get(key) {
      return this._data.find((item) => item.key === key);
    }
    /** @returns {DataType} */
    getAll() {
      return [...this._data];
    }
    /** @param {(allData: DataType) => void} callback */
    subscribe(callback) {
      this._subscribers.add(callback);
      callback(this.getAll());
    }
    /** @param {function} callback */
    unsubscribe(callback) {
      this._subscribers.delete(callback);
    }
  };
  var dataModel = new DataModel();

  // src/app/components/DataTable.js
  var DataTable = class extends Component {
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
          allData
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
        allValueChanges: {}
      });
    }
    resetAllRemove() {
      this.setState({
        allDataRemove: {}
      });
    }
    /** @param {Event} e */
    resetItem(e) {
      const target = (
        /** @type {HTMLElement} */
        e.target
      );
      const key = target.dataset.key;
      if (!key) return;
      const { allValueChanges } = this.state;
      const { [key]: _, ...restChanges } = allValueChanges;
      this.setState({
        allValueChanges: restChanges
      });
    }
    /** @param {Event} e */
    removeItem(e) {
      const target = (
        /** @type {HTMLElement} */
        e.target
      );
      const key = target.dataset.key;
      if (!key) return;
      const { allDataRemove } = this.state;
      this.setState({
        allDataRemove: {
          ...allDataRemove,
          [key]: true
        }
      });
    }
    applyAll() {
      const { allData, allValueChanges, allDataRemove } = this.state;
      const newData = allData.filter((item) => !allDataRemove[item.key]).map(({ key, val }) => ({
        key,
        val: allValueChanges[key] !== void 0 ? allValueChanges[key] : val
      }));
      dataModel.set(newData);
      this.setState({
        allValueChanges: {},
        allDataRemove: {}
      });
    }
    /** @param {Event} e */
    changeHandler(e) {
      const input = (
        /** @type {HTMLInputElement} */
        e.target
      );
      const key = input.dataset.key;
      const value = input.value.trim();
      if (!key || isNaN(Number(value))) return;
      this.setState({
        allValueChanges: {
          ...this.state.allValueChanges,
          [key]: Number(value)
        }
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
        const isChanged = currVal !== val;
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
              `}
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
  };
  customElements.define("app-data-table", DataTable);

  // src/app/components/Divider.js
  var Divider = class extends Component {
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
  };
  customElements.define("app-divider", Divider);

  // src/app/components/Editor.js
  var Editor = class extends Component {
    /**
     * @type {InputField[]}
     */
    inputs = [
      {
        name: "id",
        type: "text",
        placeholder: "ID",
        label: "Id",
        required: false
      },
      {
        name: "val",
        type: "number",
        placeholder: "VAL",
        label: "Value",
        required: true
      }
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
      const form = (
        /** @type {HTMLFormElement} */
        e.target
      );
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const id = (
        /** @type {string} */
        data.id.trim()
      );
      const val = parseInt(
        /** @type {string} */
        data.val,
        10
      );
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
  };
  customElements.define("app-editor", Editor);

  // src/app/components/Graph.js
  var Graph = class extends Component {
    /** 
     * @override
     * @type {State}
     */
    state = {
      allData: [],
      currentTypeIndex: 0,
      chartTypeList: []
    };
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
        const chartTypeList = newValue ? newValue.split(",").map((type) => type.trim()) : [];
        this.setState({ chartTypeList, currentTypeIndex: 0 });
      }
    }
    init() {
      dataModel.subscribe((allData) => {
        this.setState({ allData });
      });
    }
    renderChart() {
      const { chartTypeList, currentTypeIndex } = this.state;
      return map(chartTypeList, (chartType, index) => {
        if (index !== currentTypeIndex) return;
        switch (chartType) {
          case "bar":
            return html`<app-bar-chart class="chart"></app-bar-chart>`;
          default:
            return;
        }
      });
    }
    /** @param {Event} e */
    clickHandler(e) {
      const target = (
        /** @type {HTMLElement} */
        e.target
      );
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
        }));
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
  };
  customElements.define("app-graph", Graph);

  // src/app/components/RawEditor.js
  var RawEditor = class extends Component {
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
          error: `JSON \uD615\uC2DD\uC774 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4: ${error.message}`,
          typedJson: rawJson
        });
      }
    }
    /** @param {InputEvent} e */
    inputHandler(e) {
      const target = (
        /** @type {HTMLElement} */
        e.target
      );
      const typedJson = target.textContent.trim();
      this.state.typedJson = typedJson;
      if (this.state.rawJson.replace(/\s+/g, "") === this.state.typedJson.replace(/\s+/g, "")) {
        this.query(".actions").classList.remove("changed");
      } else {
        this.query(".actions").classList.add("changed");
      }
    }
    /**
     * JSON 문자열에 대한 구문 강조 처리
     * @param {string} jsonString
     * @returns {string}
     */
    highlightJson(jsonString) {
      return jsonString.replace(/"([^"]+)"\s*:/g, `<span class="key">"$1"</span>:`).replace(/:\s*"([^"]*)"/g, `: <span class="string">"$1"</span>`).replace(/:\s*(-?\d+(\.\d+)?)/g, `: <span class="number">$1</span>`);
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
  };
  customElements.define("app-raw-editor", RawEditor);

  // src/app/pages/Home.js
  var Home = class extends PageComponent {
    render() {
      return html`
      <div class="home">
        <div class="title">
          아이엠파인 SD팀 지원자 권해솔
        </div>

        <div style="height: 36px;"></div>

        <app-divider></app-divider>

        <div style="height: 72px;"></div>

        <div class="contents">
          <app-container>
            <app-container-title>
              Graph UI
            </app-container-title>
  
            <app-container-content>
              <app-graph chart-type-list="bar"></app-graph>
            </app-container-content>
          </app-container>

          <app-container>
            <app-container-title>
              Modify Data via Eidtor
            </app-container-title>
  
            <app-container-content>
              <div class="table-container">
                <app-data-table></app-data-table>
              </div>
            </app-container-content>
            
            <app-container-footer>
              <app-editor></app-editor>
            </app-container-footer>
          </app-container>

          <app-container>
            <app-container-title>
              Modify Data via Raw Editor
            </app-container-title>
  
            <app-container-content>
              <app-raw-editor></app-raw-editor>
            </app-container-content>
          </app-container>
        </div>

        <div style="height: 72px;"></div>
      </div>
    `;
    }
    styles = css`
    .home {
      max-width: var(--screen-xl);
      margin: auto;
      padding: 48px;
    }

    .title {
      width: 100%;
      display: flex;
      justify-content: end;
      font-weight: bold;
      font-size: 15px;
    }

    .contents {
      display: grid;
      grid-template-columns: 50%;
      gap: 24px;
    }

    .contents app-container:last-child {
      grid-column: 1/3;
    }

    .table-container {
      padding: 48px 18px;
      border-radius: 12px;
      background-color: var(--white);
    }

    @media (max-width: 1100px) {
      .contents {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    }
  `;
    afterRenderFirst() {
      dataModel.set([
        {
          key: "Jan",
          val: 12
        },
        {
          key: "Feb",
          val: -76
        },
        {
          key: "Mar",
          val: 32
        },
        {
          key: "Apr",
          val: 123
        },
        {
          key: "May",
          val: 23
        }
      ]);
    }
  };
  customElements.define("app-page-home", Home);

  // src/app/pages/NotFound.js
  var NotFound = class extends PageComponent {
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
  };
  customElements.define("app-page-not-found", NotFound);

  // src/app/App.js
  var IS_LOCAL = window.location.protocol === "file:";
  var App = class extends Component {
    /** @type {AppState} */
    state = {
      route: null
    };
    init() {
      this.state = {
        route: window.location.pathname
      };
      if (IS_LOCAL) return;
      window.addEventListener("popstate", () => {
        this.setState({ route: window.location.pathname });
      });
    }
    /**
     * @param {string} path
     * @returns {void}
     */
    navigate(path) {
      window.history.pushState({}, "", path);
      this.setState({ route: path });
    }
    /** @override */
    render() {
      if (IS_LOCAL) {
        return html`<app-page-home></app-page-home>`;
      }
      const { route } = this.state;
      if (route === "/") {
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
  };
  customElements.define("app-app", App);

  // src/index.js
  var app = document.createElement("app-app");
  var root = document.querySelector("main");
  root.appendChild(app);
})();
