import { useState } from 'react'

import './App.css'
import Landing from './pages/Landing'
import Room, { IRoom } from './pages/Room'

function App() {
  const [room, setAppRoom] = useState<IRoom | undefined>(() => {
    // first, try to get a room from the url query params:
    const search = window.location.search
    const params = new URLSearchParams(search)
    let name = params.get('name')
    let href = params.get('href')
    const code = params.get('code')
    if (href && code) {
      if (!name)
        name =
          href.replace('ws://', '').replace('wss://', '').replace(/:\d+/, '') ||
          ''
      console.log('zomg have room from query params!', { name, href })
      if (!href.startsWith('ws://') || !href.startsWith('wss://')) {
        href = `ws://${href}`
      }
      if (!href.match(/:\d+/)) {
        href = `${href}:9001`
      }
      return { name, href, code }
    }

    // otherwise fallback to localstorage
    const lRoom = localStorage.getItem('room')
    console.log('lRoom:', lRoom)
    try {
      return lRoom ? (JSON.parse(lRoom) as IRoom) : undefined
    } catch (e) {
      return undefined
    }
  })

  function setRoom(room: IRoom | undefined) {
    console.log('uh gonna localstorage set room ;/')
    localStorage.setItem('room', JSON.stringify(room))
    setAppRoom(room)
  }

  return (
    <div className="App">
      {!room ? (
        <Landing room={room} setRoom={setRoom} />
      ) : (
        <Room room={room} setRoom={setRoom} />
      )}
    </div>
  )
}

export default App
