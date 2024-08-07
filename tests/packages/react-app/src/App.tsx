import React, { useEffect, useState } from 'react'
import { Address, Wallet, Transaction, Signature, SignatureType } from '@zondax/izari-filecoin'

import logo from './logo.svg'
import './App.css'

const rawTx = {
  tx: {
    To: 'f099',
    From: 'f1bnjnkzxzicbmhlo4nsgtbos4exostzozuxu26ba',
    Value: '71115',
    Params: '',
    GasFeeCap: '91579',
    GasPremium: '21176',
    GasLimit: 69240,
    Nonce: 6129,
    Method: 7283,
  },
  cbor: '8a0042006355010b52d566f94082c3addc6c8d30ba5c25dd29e5d91917f144000115cb1a00010e7844000165bb430052b8191c7340',
  signature: {
    data: 'wW6G6jykbQQWL+J8V/TcbmTvgN7e71EM8WxC54nfv5gd1nc0CvPGFND1ndfWmVQ1Fl6W1Liyc3pD4jAYTz/Z9AE=',
    type: 1,
  },
  privKey: '/mTHfeTNwxj1EYjBgbk7ZORx5nKe4ShunXXtvVQ58CA=',
}

function App() {
  const [signature, setSignature] = useState<Signature | null>(null)
  const address = Address.fromString('t08666')
  const mnemonic = Wallet.generateMnemonic()
  const account = Wallet.deriveAccount(
    'bundle hour bird man lyrics glare shrug pepper leader better illegal expect outdoor duck crew universe amount language model cabbage inhale shine accident inmate',
    SignatureType.SECP256K1,
    "44'/461'/1'/0/0"
  )

  useEffect(() => {
    const partialAccount = { privateKey: Buffer.from(rawTx.privKey, 'base64'), type: 1 }
    Wallet.signTransaction(partialAccount, Transaction.fromJSON(rawTx.tx)).then(sig => {
      setSignature(sig)
    })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img id={'logo'} src={logo} className="App-logo" alt="logo" />
        <div id={'network'}>{`Network: ${address.getNetworkPrefix().toString()}`}</div>
        <div id={'protocol'}>{`Protocol: ${address.getProtocol().toString()}`}</div>
        <div id={'string'}>{`String: ${address.toString()}`}</div>
        <div id={'bytes'}>{`Bytes: ${address.toBytes().toString('hex')}`}</div>
        <div id={'payload'}>{`Payload: ${address.getPayload().toString('hex')}`}</div>

        <br />

        <div id={'mnemonic'}>{`Mnemonic: ${mnemonic}`}</div>
        <div id={'address'}>{`Address: ${account.address.toString()}`}</div>

        <br />

        {signature ? <div id={'signature-data'}>{`Signature Data: ${signature.toJSON().Data}`}</div> : null}
        {signature ? <div id={'signature-type'}>{`Signature Type: ${signature.toJSON().Type}`}</div> : null}
      </header>
    </div>
  )
}

export default App
