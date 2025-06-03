import { useState } from 'react'

import useInterval from '../hooks'
import './Landing.css'
import { IRoom } from './Room'

export interface LandingProps {
  setRoom: (room: IRoom) => void
}

type RoomList = IRoom[]

const KNOWN_ROOMS: RoomList = [
  { name: 'LOCALHOST', href: 'ws://localhost:9001', code: '' },
  // { name: 'FOLK', href: 'ws://10.246.17.194:9001' },
  // { name: 'PIZZAPARTY', href: 'wss://youoke.ngrok.pizza' },
]

function testRoom(href: string): Promise<boolean> {
  // simple ping to see if server is alive
  return fetch(
    `${href.replace('ws://', 'http://').replace('wss://', 'https://')}/hello`
  )
    .then((response) => response.status === 200)
    .catch(() => false)
}

function testCode(href: string, code: string): Promise<boolean> {
  // simple ping to see if server is alive
  const fixed_href = href
    .replace('ws://', 'http://')
    .replace('wss://', 'https://')
    .replace('9001', '9002')
  return fetch(`${fixed_href}/hello?code=${code}`)
    .then((response) => response.status === 200)
    .catch(() => false)
}

export default function Landing(props: LandingProps) {
  const { setRoom } = props

  const [code, setCode] = useState('')
  const [needsCode, setNeedsCode] = useState(false)
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
        testRoom(room.href)
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
            // console.warn('onoz, bad room!', room, ' error:', e)
            // 🤷‍♀️
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
                    setNeedsCode(true)
                  }}
                >
                  {needsCode ? (
                    <label className="code">
                      code
                      <input
                        type="text"
                        onChange={(e) => {
                          const c = e.target.value
                          setCode(c)
                          if (c.length > 5) {
                            testCode(room.href, c)
                              .then((success) => {
                                if (!success) return
                                setRoom({ ...room, code: c })
                                setDelay(null)
                              })
                              .catch(() => {})
                          }
                        }}
                        value={code}
                        placeholder="6 digit number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </label>
                  ) : (
                    room.name
                  )}
                </li>
              ))}
        </ol>
      </div>
    </div>
  )
}
