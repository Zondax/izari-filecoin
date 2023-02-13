declare module 'leb128' {
  interface Handler {
    encode: (data: string | number | Buffer) => Buffer
    decode: (data: Buffer) => string
  }
  declare const unsigned: Handler
  declare const signed: Handler
}
