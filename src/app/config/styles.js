/**
 * CSS 템플릿 리터럴을 처리하는 헬퍼 함수입니다.
 * 아래 vscode extension을 설치하면 원할한 모습을 볼 수 있습니다.
 * 
 * @see https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin
 * @param {TemplateStringsArray} strings
 * @param  {...any} values
 * @returns {string}
 */
export function css(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
}

/**
 * 객체를 인라인 스타일 문자열로 변환하는 함수
 * @param {Partial<CSSStyleDeclaration>} styles - 스타일 객체
 * @returns {string} - 인라인 스타일 문자열
 */
export function styleMap(styles) {
  return Object.entries(styles)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
    .join("; ");
}

export const resetStyles = css`
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

export const globalStyles = css`
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