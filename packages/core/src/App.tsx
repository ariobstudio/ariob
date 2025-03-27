import { lazy, useCallback, useEffect, useState } from '@lynx-js/react'
import SEA from '@/gun/sea/sea.js'
// import Gun from "@/gun/index.js"

import './App.css'
import eraLogo from './assets/era.png'


async function testDirectEncryptDecryptManual() {
  console.log("TEST - Starting manual encryption/decryption")
  // Use fixed values for consistent testing
  var aeskey = require('@/gun/sea/aeskey.js');
  const plaintext = "test message2";
  const testKey = await aeskey("testKey2", SEA.Buffer.from("testSalt"));
  const testIV = Array.from(SEA.Buffer.from("testIVtestIVtest")).map(b => b);
  
  const seaEnc = await SEA.encrypt(plaintext, testKey);
  console.log("TEST - Using key:", testKey);
  console.log("TEST - Using IV:", testIV.slice(0, 5));
  console.log("TEST - SEA Encrypted:", seaEnc);
  // Encrypt
  const encodedText = NativeModules.NativeWebCryptoModule.textEncode(plaintext);
  console.log("TEST - Encoded text:", encodedText);
  
  const encrypted = await NativeModules.NativeWebCryptoModule.encrypt(
    JSON.stringify({name: 'AES-GCM', iv: testIV}),
    testKey,
    encodedText
  );
  console.log("TEST - Encrypted result:", encrypted);
  
  const seaDec = await SEA.decrypt(seaEnc, testKey);
  console.log("TEST - SEA Decrypted:", seaDec);
  // Decrypt
  const decrypted = await NativeModules.NativeWebCryptoModule.decrypt(
    JSON.stringify({name: 'AES-GCM', iv: testIV}),
    testKey,
    encrypted
  );
  console.log("TEST - Decrypted result:", decrypted);
  
  const decodedText = NativeModules.NativeWebCryptoModule.textDecode(decrypted);
  console.log("TEST - Decoded text:", decodedText);
  
  return decodedText === plaintext;
}
// // Add this function to test direct encryption/decryption
// async function testDirectEncryptDecrypt() {
//   // Use fixed values for consistent testing
//   var aeskey = require('@/gun/sea/aeskey.js');
//   const plaintext = "test message";
//   const testKey = await aeskey("testKey", SEA.Buffer.from("testSalt"));
//   const testIV = Array.from(SEA.Buffer.from("testIVtestIVtest")).map(b => b);
  
//   console.log("TEST - Using key:", testKey);
//   console.log("TEST - Using IV:", testIV.slice(0, 5));
  
//   // Encrypt
//   const encodedText = NativeModules.NativeWebCryptoModule.textEncode(plaintext);
//   console.log("TEST - Encoded text:", encodedText);
  
//   const encrypted = await SEA.encrypt(plaintext, testKey);
//   console.log("TEST - Encrypted result:", encrypted);
  
//   // Decrypt
//   const decrypted = await SEA.decrypt(encrypted, testKey);
//   console.log("TEST - Decrypted result:", decrypted);
  
//   const decodedText = NativeModules.NativeWebCryptoModule.textDecode(decrypted);
//   console.log("TEST - Decoded text:", decodedText);
  
//   return decodedText === plaintext;
// }
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
    'background only'
    // const gun = Gun({peers: ["http://localhost:8765/gun"]})
    var pair = await SEA.pair();
    var enc = await SEA.encrypt('I am sending this message to the world but only one can read it', pair);
    var data = await SEA.sign(enc, pair);
    var verified = await SEA.verify(data, pair);
    
    console.log("TEST RESULT VERIFIED:", verified)

    var dec = await SEA.decrypt(enc, pair);
    var proof = await SEA.work(dec, pair);
    var check = await SEA.work('hello self', pair);
    console.log("TEST RESULT ENCRYPTED:", enc)
    console.log("TEST RESULT DECRYPTED:", dec)
    console.log("TEST RESULT SIGNED:", signed)
    // console.log("TEST RESULT VERIFIED:", verified)
    setPair(JSON.stringify(pair))
    setEnc(enc)
    setDec(dec)
    setSigned(data)
    setProof(proof)
    setCheck(check)

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
