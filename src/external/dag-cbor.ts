// As we cannot load the package directly because it has not support to ESM,
// we create the basic interface we need in order to make it work on the project.
export type IpldDagCbor = {
  name: 'dag-cbor'
  code: 113
  encode<T>(node: T): Uint8Array
  decode<T>(data: Uint8Array): T
}
