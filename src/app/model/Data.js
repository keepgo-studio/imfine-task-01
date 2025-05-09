// @ts-check

/**
 * @typedef {Object} KeyValuePair
 * @property {string} key
 * @property {number} val
 */

/**
 * @typedef {KeyValuePair[]} DataType
 */
class DataModel {
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
 _subscribers = new Set();
 
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
    return this._data.findIndex(item => item.key === key);
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
      const uniqueKeys = new Set();
  
      newData.forEach(newItem => {
        const { key, val, ...rest } = newItem;
  
        // Key 유효성 검사
        if (!this._isValidKey(key)) {
          throw new Error(`Invalid key "${key}". Keys must be non-empty strings.`);
        }
  
        // Key 중복 검사
        if (uniqueKeys.has(key)) {
          throw new Error(`Duplicate key "${key}" is not allowed.`);
        }

        // Value 유효성 검사
        if (typeof val !== "number" || isNaN(val)) {
          throw new Error(`Invalid value for item(key"${key}") - "val" must be a number.`);
        }

        // 추가 필드 검사
        const extraFields = Object.keys(rest);

        if (extraFields.length > 0) {
          throw new Error(`Invalid fields for item(key"${key}") - ${extraFields.map(restKey => `{ "${restKey}" : ${rest[restKey]} }`).join(", ")}`);
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
    return this._data.find(item => item.key === key);
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
}

export const dataModel = new DataModel();
