import { useState, useEffect } from 'react'

import useInterval from '../hooks'
import './Landing.css'
import { IRoom } from './Room'

export interface LandingProps {
  room?: IRoom
  setRoom: (room: IRoom) => void
}

type RoomList = IRoom[]

const search = window.location.search
const params = new URLSearchParams(search)
const code = params.get('code') || ''

const tryToTidyNameOrHref = (name?: string | null, href?: string | null) => {
  if (!name && !href) return

  if (!name && href) {
    name =
      href.replace('ws://', '').replace('wss://', '').replace(/:\d+/, '') || ''
  }

  if (!href && name) href = name

  // still no href?!
  if (!href || !name) return

  if (!href.startsWith('ws://') || !href.startsWith('wss://')) {
    href = `ws://${href}`
  }
  if (!href.match(/:\d+/)) {
    href = `${href}:9001`
  }

  console.log('zomg tryToTidyNameOrHref', { name, href, code })

  return { name, href, code }
}

const getWindowLocationRoom = () => {
  const name = window.location.hostname.includes('youoke.party')
    ? 'LOCALHOST' // all capz, cuz better
    : window.location.hostname
  const href = `ws://${name.toLowerCase()}:9001`
  return { name, href, code }
}

const getQueryParamsRoom = () =>
  tryToTidyNameOrHref(params.get('name'), params.get('href'))

const getSpecialRooms = () => {
  const queryParamsRoom = getQueryParamsRoom()
  if (!queryParamsRoom) {
    return [getWindowLocationRoom()]
  } else {
    return [getWindowLocationRoom(), queryParamsRoom]
  }
}

const KNOWN_ROOMS: RoomList = [
  ...getSpecialRooms(),
  // { name: 'PIZZAPARTY', href: 'wss://youoke.ngrok.pizza', code },
]

function testRoom(href: string): Promise<boolean> {
  // simple ping to see if server is alive
  return fetch(
    `${href.replace('ws://', 'http://').replace('wss://', 'https://').replace('9001', '9002')}/hello`
  )
    .then((response) => response.status === 200 || response.status === 401)
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
  const { room, setRoom } = props

  const [isHttps, setIsHttps] = useState(false)
  const [code, setCode] = useState('')
  const [needsCode, setNeedsCode] = useState<Record<string, boolean>>({})
  const [addNewRoom, setAddNewRoom] = useState(false)
  const [newRoom, setNewRoom] = useState<IRoom>({
    name: '',
    href: '',
    code: '',
  })
  const [roomsToFind, setRoomsToFind] = useState(KNOWN_ROOMS)
  const [roomList, setRoomList] = useState<RoomList>()
  const [delay, setDelay] = useState<number | null>(1000)

  useEffect(() => {
    setIsHttps(window.location.protocol === 'https:')
  }, [])

  useEffect(() => {
    if (!room) return
    console.log('zomg add props room!', room)
    setRoomsToFind((prev) => [...prev, room])
  }, [room])

  useInterval(
    () => {
      if (roomsToFind.length === 0) {
        setDelay(null)
        return
      }
      roomsToFind.forEach((room) => {
        testRoom(room.href)
          .then((success) => {
            if (!success) return
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
      {isHttps && (
        <>
          <h2>important! you're using "https://"</h2>
          <p>
            so you need to manually type the "http://" part of
            "http://youoke.party"
          </p>
          <p>
            <em>...which is anoying, yeah</em>
          </p>
          <p>
            (i wish there was a better way, but your browser doesn't think i
            should do that for you, which is, in some ways, understandable, but
            in other ways, infuriating 🤷)
          </p>
        </>
      )}
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
                {/* <label>
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
                </label> */}

                <div className="btn-row">
                  <div
                    className="btn"
                    onClick={() => {
                      setRoomsToFind((prev) => {
                        const fixedNewRoom = tryToTidyNameOrHref(
                          newRoom.name,
                          newRoom.href
                        )
                        if (!fixedNewRoom || !fixedNewRoom.href) return prev
                        if (prev.find((r) => r.href === fixedNewRoom.href)) {
                          return prev
                        }
                        return [...prev, fixedNewRoom]
                      })
                      // reset inputz?
                      // setNewRoom(KNOWN_ROOMS[0])
                      setAddNewRoom(false)
                      setDelay(1000)
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
                    setNeedsCode((prev) => ({
                      ...prev,
                      [`${room}${idx}`]: true,
                    }))
                  }}
                >
                  {needsCode[`${room}${idx}`] ? (
                    <label className="code">
                      code
                      <input
                        autoFocus
                        type="text"
                        onChange={(e) => {
                          const c = e.target.value
                          setCode(c)
                          if (c.length > 5) {
                            testCode(room.href, c).then((success) => {
                              if (!success) return
                              setRoom({ ...room, code: c })
                              setDelay(null)
                            })
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            testCode(room.href, code).then((success) => {
                              if (!success) return
                              setRoom({ ...room, code })
                              setDelay(null)
                            })
                          } else if (e.key === 'Escape') {
                            setNeedsCode((prev) => ({
                              ...prev,
                              [`${room}${idx}`]: false,
                            }))
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
