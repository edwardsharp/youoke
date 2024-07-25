import { useState } from 'react'

import useInterval from '../hooks'
import './Landing.css'
import { IRoom } from './Room'

export interface LandingProps {
  setRoom: (room: IRoom) => void
}

type RoomList = IRoom[]

const KNOWN_ROOMS: RoomList = [
  { name: 'LOCALHOST', href: 'localhost:9001' },
  { name: 'FOLK', href: '10.246.17.194:9001' },
]

function testWS(href: string): Promise<boolean> {
  const ws = new WebSocket(`ws://${href}`)

  return new Promise((resolve, reject) => {
    ws.onerror = () => reject(false)
    ws.onopen = () => {
      ws.close()
      resolve(true)
    }
  })
}

export default function Landing(props: LandingProps) {
  const { setRoom } = props

  const [addNewRoom, setAddNewRoom] = useState(false)
  const [newRoom, setNewRoom] = useState<IRoom>(KNOWN_ROOMS[0])
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
          <li
            className={addNewRoom ? undefined : 'list-btn'}
            tabIndex={0}
            onClick={() => !addNewRoom && setAddNewRoom(true)}
          >
            {addNewRoom ? (
              <>
                <label>
                  name
                  <input
                    type="text"
                    onChange={(e) =>
                      setNewRoom((prev: IRoom) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    value={newRoom.name}
                    placeholder="name"
                  />
                </label>
                <label>
                  href
                  <input
                    type="text"
                    onChange={(e) =>
                      setNewRoom((prev: IRoom) => ({
                        ...prev,
                        href: e.target.value,
                      }))
                    }
                    value={newRoom.href}
                    placeholder="href"
                  />
                </label>

                <div className="btn-row">
                  <div
                    className="btn"
                    onClick={() => {
                      setRoomsToFind((prev) => {
                        if (
                          prev.find(
                            (r) =>
                              r.name === newRoom.name && r.href === newRoom.href
                          )
                        ) {
                          return prev
                        }

                        return [...prev, newRoom]
                      })
                      // reset inputz?
                      // setNewRoom(KNOWN_ROOMS[0])
                      setAddNewRoom(false)
                    }}
                  >
                    add new room
                  </div>

                  <div
                    className="btn"
                    onClick={() => {
                      setAddNewRoom(false)
                    }}
                  >
                    x
                  </div>
                </div>
              </>
            ) : (
              'find room...'
            )}
          </li>

          {!roomList
            ? 'looking for rooms...'
            : roomList.map((room, idx) => (
                <li
                  className="list-btn"
                  key={`${room}${idx}`}
                  tabIndex={idx}
                  onClick={() => {
                    setRoom(room)
                    setDelay(null)
                  }}
                >
                  {room.name}
                </li>
              ))}
        </ol>
      </div>
    </div>
  )
}
