// @ts-check

import { globalStyles, resetStyles } from "./styles.js";
import { css } from "../config/styles.js";

const EVENT_PREFIX = "@";

/**
 * 기본 컴포넌트 클래스
 * Shadow DOM과 이벤트 바인딩을 지원하는 웹 컴포넌트 베이스 클래스
 */
export default class Component extends HTMLElement {
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
    const target = /** @type {Element | null} */ (event.target);
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
    this.shadowRoot = this.attachShadow({ mode: 'open' });
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
  init() {}

  /**
   * 렌더링 로직을 정의합니다.
   * @returns {string} 렌더링할 HTML 문자열
   */
  render() { return html`` }

  /** 첫 렌더링 이후 호출됩니다. */
  afterRenderFirst() {}

  /** 매 렌더링 이후 호출됩니다. */
  afterRender() {}

  /** 컴포넌트가 DOM에서 제거될 때 호출됩니다. */
  afterDeleted() {}
}

/**
 * 페이지 전환을 지원하는 페이지 컴포넌트
 */
export class PageComponent extends Component {
  /**
   * 특정 path으로 이동
   * @param {string} path
   */
  navigate(path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

/**
 * HTML 템플릿 리터럴을 처리하는 헬퍼 함수입니다.
 * 
 * 아래 vscode extension을 설치하면 원할한 모습을 볼 수 있습니다.
 * 
 * @example
 * html`<div @click=${this.clickHandler}>hello world</div>`
 * 
 * @see https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin
 * @param {TemplateStringsArray} strings
 * @param  {...any} values
 * @returns {string}
 */
export function html(strings, ...values) {
  let result = "";

  strings.forEach((string, index) => {
    const value = values[index];

    switch(typeof value) {
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
        // double quotes preprocessing
        // 다음 문자열이 attribute 끝인 경우만 쌍따옴표 추가
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

/**
 * html을 배열로 반환할 때 쓰이는 헬퍼함수
 * @example
 * map(arr, (item) => html`<div>${item.val}</div>`);
 * 
 * @template T 
 * @param {T[]} arr
 * @param {(item: T, index: number) => string} callback
 * @returns {string}
 */
export function map(arr, callback) {
  return arr.map(callback).join("");
}