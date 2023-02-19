const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
export const waitFor = async <T>(f: () => T | undefined): Promise<T> => {
  let ret = f()
  while (!ret) {
    await sleep(50)
    ret = f()
  }
  return ret
}
