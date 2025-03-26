import { lazy, useCallback, useEffect, useState } from '@lynx-js/react'
import SEA from '@/gun/sea/sea.js'

import './App.css'
import eraLogo from './assets/era.png'

// Add this function to test direct encryption/decryption
async function testDirectEncryptDecrypt() {

}

export function App() {
  const [pair, setPair] = useState("")
  const [enc, setEnc] = useState("")
  const test = useCallback(async () => {
    const result = await testDirectEncryptDecrypt();
    // const resultManual = await testDirectEncryptDecryptManual();
    console.log("TEST RESULT:", result);
    // console.log("TEST RESULT MANUAL:", resultManual);
  }, [])
  useEffect(() => {
    test()
  }, [])
  const createPair = useCallback(async () => {
    'background only'
    var pair = await SEA.pair();
    const pairString = JSON.stringify(pair)
    console.log("PAIR: ", pairString)
    var enc = await SEA.encrypt('hello world', pair);
    var dec = await SEA.decrypt(enc, pair);
    console.log("ENCRYPTED: ", enc)
    console.log("DECRYPTED", dec)
    setPair(pairString)
    setEnc(enc)
  }, [])
  
  return (
    <view>
      <view className='App'>
        <view className='Banner'>
          <view className='Logo' bindtap={createPair}>
            <image src={eraLogo} className='Logo--react' />
          </view>
        </view>
        <view className='Content'>
          <text className='Description'>
            Security Encryption Authentication
          </text>
          <text className='Hint'>
            Click the logo to generate a key pair
          </text>
          <text className='Hint'>
            {pair}
          </text>
          <text className='Hint'>
            {enc}
          </text>
        </view>
        <view style={{ flex: 1 }}></view>
      </view>
    </view>
  )
}
