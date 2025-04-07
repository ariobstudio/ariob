import { lazy, useCallback, useEffect, useState } from '@lynx-js/react'
import SEA from '@/gun/sea/sea.js'
// import Gun from "@/gun/index.js"

import './App.css'
import eraLogo from './assets/era.png'


export function App() {
  
  const [pair, setPair] = useState("")
  const [enc, setEnc] = useState("")
  const [dec, setDec] = useState("")
  const [signed, setSigned] = useState("")
  const [proof, setProof] = useState("")
  const [check, setCheck] = useState("")
  const test = useCallback(async () => {
    // const result = await testDirectEncryptDecrypt();
    // const resultManual = await testDirectEncryptDecryptManual();
    // // console.log("TEST RESULT:", result);
    // console.log("TEST RESULT MANUAL:", resultManual);
    // console.log("HELLO SEA")
  }, [])
  useEffect(() => {
    test()
  }, [])
  const createPair = useCallback(async () => {
    // const gun = Gun({peers: ["http://localhost:8765/gun"]})
    // var pair = await SEA.pair();
    // var m = "I am sending this message to the world but only one can read it"
    // var enc = await SEA.encrypt(m , pair);
    // var data = await SEA.sign(enc, pair);
    // var msg = await SEA.verify(data, pair);
    
    // // console.log("TEST RESULT VERIFIED:", verified)

    // var dec = await SEA.decrypt(msg, pair);
    // var proof = await SEA.work(dec, pair);
    // var check = await SEA.work(m, pair);
    // console.log("TEST RESULT ENCRYPTED:", enc)
    // console.log("TEST RESULT DECRYPTED:", dec)
    // console.log("TEST RESULT SIGNED:", signed)
    var pair = await SEA.pair();
    var enc = await SEA.encrypt('hello self', pair);
    var data = await SEA.sign(enc, pair);
    console.log(data);
    var msg = await SEA.verify(data, pair.pub);
    var dec = await SEA.decrypt(msg, pair);
    var proof = await SEA.work(dec, pair);
    var check = await SEA.work('hello self', pair);
    console.log(dec);
    console.log(proof === check);
    // now let's share private data with someone:
    var alice = await SEA.pair();
    var bob = await SEA.pair();
    var enc2 = await SEA.encrypt('shared data', await SEA.secret(bob.epub, alice));
    var dec2 = await SEA.decrypt(enc2, await SEA.secret(alice.epub, bob));

    console.log(enc2, dec2)
    // console.log("TEST RESULT VERIFIED:", verified)
    setPair(JSON.stringify(pair))
    setEnc(enc)
    setDec(dec)
    setSigned(data)
    setProof(proof)
    setCheck(check)

    // ANOTHER TEST:
    // var alice = await SEA.pair();
    // var bob = await SEA.pair();
    // console.log("ALICE: ", JSON.stringify(alice))
    // console.log("BOB: ", JSON.stringify(bob))
    

    // var encryp = await SEA.encrypt('shared data', await SEA.secret(bob.epub, alice));
    // var decryp = await SEA.decrypt(enc, await SEA.secret(alice.epub, bob));
    // console.log("ENCRYPTED: ", encryp)
    // console.log("DECRYPTED: ", decryp)
    // setVerified(verified)
    // setVerified(verified)
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
            PAIR: {pair}
          </text>
          <text className='Hint'>
            ENCRYPTED: {enc}
          </text>
          <text className='Hint'>
            DECRYPTED: {dec}
          </text>
          <text className='Hint'>
            SIGNED: {signed}
          </text>
          <text className='Hint'>
            PROOF: {proof}
          </text>
          <text className='Hint'>
            CHECK: {check}
          </text>
          <text className='Hint'>
            {proof === check ? "PROOF MATCHES CHECK" : "PROOF DOES NOT MATCH CHECK"}
          </text>
        </view>
        <view style={{ flex: 1 }}></view>
      </view>
    </view>
  )
}
