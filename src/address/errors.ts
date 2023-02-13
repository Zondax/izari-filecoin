export class UnknownProtocolIndicator extends Error {
  constructor() {
    super()
    this.message = 'Unknown protocol indicator byte.'
  }
}

export class InvalidPayloadLength extends Error {
  constructor() {
    super()
    this.message = 'Invalid payload length.'
  }
}

export class InvalidNamespace extends Error {
  constructor() {
    super()
    this.message = 'Invalid namespace.'
  }
}

export class InvalidSubAddress extends Error {
  constructor() {
    super()
    this.message = 'Invalid subAddress.'
  }
}

export class ProtocolNotSupported extends Error {
  constructor(protocolName: string) {
    super()
    this.message = `${protocolName} protocol not supported.`
  }
}

export class InvalidChecksumAddress extends Error {
  constructor() {
    super()
    this.message = `Invalid address (checksum not matching the payload).`
  }
}

export class InvalidPrivateKeyFormat extends Error {
  constructor() {
    super()
    this.message = 'Private key need to be an instance of Buffer or a base64 string.'
  }
}
