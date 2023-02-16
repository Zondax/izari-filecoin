import React from 'react'
import { Address } from '@zondax/izari-filecoin-tools'

import logo from './logo.svg'
import './App.css'

// Inject NodeJS Buffer API implementation on the react app
window.Buffer = window.Buffer || require('buffer').Buffer

function App() {
  const add = Address.fromString('t08666')
  return (
    <div className="App">
      <header className="App-header">
        <img id={'logo'} src={logo} className="App-logo" alt="logo" />
        <div id={'network'}>{`Network: ${add.network.toString()}`}</div>
        <div id={'protocol'}>{`Protocol: ${add.protocol.toString()}`}</div>
        <div id={'string'}>{`String: ${add.toString()}`}</div>
        <div id={'bytes'}>{`Bytes: ${add.toBytes().toString('hex')}`}</div>
        <div id={'payload'}>{`Payload: ${add.payload.toString('hex')}`}</div>
      </header>
    </div>
  )
}

export default App
