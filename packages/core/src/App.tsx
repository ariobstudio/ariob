import { lazy, useCallback, useEffect, useState } from '@lynx-js/react'
import SEA from '@/gun/sea/sea.js'

import './App.css'
import eraLogo from './assets/era.png'

export function App() {
  const [pair, setPair] = useState("")
  useEffect(() => {
    console.info('Hello, ')
  }, [])

  const createPair = useCallback(async () => {
    'background only'
    const pair = await SEA.pair();
    const pairString = JSON.stringify(pair)
    setPair(pairString)
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
        </view>
        <view style={{ flex: 1 }}></view>
      </view>
    </view>
  )
}
