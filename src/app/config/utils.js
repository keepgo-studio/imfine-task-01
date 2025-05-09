// @ts-check

/**
 * Creates a range of numbers.
 * @param {number} start - The starting number (inclusive).
 * @param {number} [end] - ⭐️ The ending number (exclusive). If omitted, start becomes 0 and end is the first argument.
 * @param {number} [step=1] - The step size.
 * @returns {number[]}
 */
export function range(start, end, step = 1) {
  // if arguments length is 1
  if (end === undefined) {
    end = start;
    start = 0;
  }

  // check direction
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

const colorPalette = [
  "#FF6B6B", "#FF8E72", "#FFA94D", "#FFC300",
  "#FFD700", "#FFF700", "#A7F432", "#32CD32",
  "#00FA9A", "#00CED1", "#00BFFF", "#1E90FF",
  "#4169E1", "#6A5ACD", "#8A2BE2", "#9400D3",
  "#9932CC", "#C71585", "#FF1493", "#FF69B4",
  "#FF6EB4", "#FF83FA", "#FFA07A", "#FF4500"
];

/**
 * 키를 기반으로 팔레트에서 색상을 선택하는 함수
 * @param {string} key
 * @returns {string}
 */
export function getColorByKey(key) {
  const index = Math.abs(
    [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % colorPalette.length;
  
  return colorPalette[index];
}

/**
 * @param {number} ms - 지연 시간 (밀리초)
 * @returns {Promise<void>}
 */
export function delay(ms = 1000) {
  return new Promise(res => setTimeout(res, ms));
}
