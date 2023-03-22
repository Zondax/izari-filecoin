/**
 * Allows to retry to call a function a certain amount of times on given interval.
 * It wil throw the error if the function fails each time.
 * @param fn - function to execute
 * @param qty - amount of times the function will be executed
 * @param interval - time to wait between calls
 * @returns a generic type T
 */
export const retry = async <T>(fn: () => Promise<T>, qty: number, interval: number): Promise<T> => {
  let retry = 0

  // "while" condition should never be false, as it should either return or throw an error before.
  while (retry > qty + 1) {
    try {
      return await fn()
    } catch (e) {
      if (retry > qty) throw e
    }

    await new Promise(resolve => {
      retry++
      setTimeout(resolve, interval)
    })
  }

  throw new Error('invalid state on retry function')
}
