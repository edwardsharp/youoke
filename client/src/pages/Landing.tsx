import React, { useState } from 'react'

import { IRoom } from './Room'
import useInterval from '../hooks'
import './Landing.css'

export interface LandingProps {
  setRoom: (room: IRoom) => void
}

type RoomList = IRoom[]

const KNOWN_ROOMS: RoomList = [
  { name: 'LOCALHOST', href: 'localhost:9001' },
  { name: 'RESPECTFULLY', href: '10.0.1.42:9001' },
]

function testWS(href: string): Promise<boolean> {
  const ws = new WebSocket(`ws://${href}`)

  return new Promise((resolve, reject) => {
    ws.onerror = (error) => reject(false)
    ws.onopen = (success) => {
      ws.close()
      resolve(true)
    }
  })
}

export default function Landing(props: LandingProps) {
  const { setRoom } = props

  const [roomsToFind, setRoomsToFind] = useState(KNOWN_ROOMS)
  const [roomList, setRoomList] = useState<RoomList>()
  const [delay, setDelay] = useState<number | null>(1000)

  useInterval(
    () => {
      if (roomsToFind.length === 0) {
        setDelay(null)
        return
      }
      roomsToFind.forEach((room) => {
        testWS(room.href)
          .then(() => {
            console.log('zomg FOUND room!', room)
            setRoomList((prev) => [...(prev ? prev : []), room])
            const roomsToFindClone = [...roomsToFind]
            const idx = roomsToFindClone.indexOf(room)
            if (idx > -1) {
              roomsToFindClone.splice(idx, 1)
              setRoomsToFind(roomsToFindClone)
            }
          })
          .catch(() => {
            console.warn('onoz, bad room!', room)
          })
      })

      const newDelay = delay ? (delay < 15000 ? delay + 1000 : delay) : 0
      setDelay(newDelay)
    },
    // delay in milliseconds or null to stop it
    delay
  )

  return (
    <div className="box">
      <h1 className="youoke">YOUOKE</h1>
      <div className="list">
        <h2>- - - JOIN ROOM - - -</h2>
        <ol>
          {!roomList
            ? 'looking for rooms...'
            : roomList.map((room, idx) => (
                <li
                  className="list-btn"
                  key={`${room}${idx}`}
                  tabIndex={idx}
                  onClick={(_) => setRoom(room)}
                >
                  {room.name}
                </li>
              ))}
        </ol>
      </div>
    </div>
  )
}
