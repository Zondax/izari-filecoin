// As we cannot load the package directly because it has not support to ESM,
// we create the basic interface we need in order to make it work on the project.
export type Multiformats = {
  CID: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parse: (input: string) => any
  }
}
