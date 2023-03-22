export const retry = async <T>(fn: () => Promise<T>, qty: number, interval: number): Promise<T> => {
  let retry = 0
  while (true) {
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
}
