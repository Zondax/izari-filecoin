import React from 'react'
import { Address, Wallet } from '@zondax/izari-filecoin-tools'

import logo from './logo.svg'
import './App.css'

function App() {
  const add = Address.fromString('t08666')
  const mnemonic = Wallet.generateMnemonic()
  const extendedKey = Wallet.keyDerive(
    'bundle hour bird man lyrics glare shrug pepper leader better illegal expect outdoor duck crew universe amount language model cabbage inhale shine accident inmate',
    "44'/461'/1'/0/0"
  )
  return (
    <div className="App">
      <header className="App-header">
        <img id={'logo'} src={logo} className="App-logo" alt="logo" />
        <div id={'network'}>{`Network: ${add.network.toString()}`}</div>
        <div id={'protocol'}>{`Protocol: ${add.protocol.toString()}`}</div>
        <div id={'string'}>{`String: ${add.toString()}`}</div>
        <div id={'bytes'}>{`Bytes: ${add.toBytes().toString('hex')}`}</div>
        <div id={'payload'}>{`Payload: ${add.payload.toString('hex')}`}</div>
        <br />

        <div id={'mnemonic'}>{`Mnemonic: ${mnemonic}`}</div>
        <div id={'address'}>{`Address: ${extendedKey.address}`}</div>
      </header>
    </div>
  )
}

export default App
