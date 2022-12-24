// @ts-check

/**
 * @param {number} time How long (in ms) to wait for
 */
const wait = (time) => new Promise((res) => setTimeout(res, time))

export class Mutex {
  /**
   * @private
   * @type {boolean}
   */
  _locked = false

  /**
   * @returns {Promise<{ unlock: () => void }>}
   */
  async lock() {
    while (this._locked) await wait(10)

    this._locked = true
    return { unlock: () => (this._locked = false) }
  }
}
