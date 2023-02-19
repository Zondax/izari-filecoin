export type IpldDagCbor = {
  name: 'dag-cbor'
  code: 113
  encode<T>(node: T): Uint8Array
  decode<T>(data: Uint8Array): T
}
