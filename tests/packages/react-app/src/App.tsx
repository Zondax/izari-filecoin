import React from 'react'
import { Address, Wallet } from '@zondax/izari-filecoin-tools'

import logo from './logo.svg'
import './App.css'

function App() {
  const address = Address.fromString('t08666')
  const mnemonic = Wallet.generateMnemonic()
  const extendedKey = Wallet.keyDerive(
    'bundle hour bird man lyrics glare shrug pepper leader better illegal expect outdoor duck crew universe amount language model cabbage inhale shine accident inmate',
    "44'/461'/1'/0/0"
  )

  return (
    <div className="App">
      <header className="App-header">
        <img id={'logo'} src={logo} className="App-logo" alt="logo" />
        <div id={'network'}>{`Network: ${address.network.toString()}`}</div>
        <div id={'protocol'}>{`Protocol: ${address.protocol.toString()}`}</div>
        <div id={'string'}>{`String: ${address.toString()}`}</div>
        <div id={'bytes'}>{`Bytes: ${address.toBytes().toString('hex')}`}</div>
        <div id={'payload'}>{`Payload: ${address.payload.toString('hex')}`}</div>

        <br />

        <div id={'mnemonic'}>{`Mnemonic: ${mnemonic}`}</div>
        <div id={'address'}>{`Address: ${extendedKey.address}`}</div>
      </header>
    </div>
  )
}

export default App
