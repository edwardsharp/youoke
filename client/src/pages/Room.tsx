import React, { useEffect, useRef, useState, useCallback } from 'react'
import debounce from 'lodash.debounce'

import './Room.css'
import youtubeSearch, { YTSearchItem } from '../youtube'

export interface IRoom {
  name: string
  href: string
}

export interface RoomProps {
  room: IRoom
  setRoom: (room?: IRoom) => void
}

export interface QueueRequest {
  Queue: {
    id: string
    singer: string
  }
}
export interface QueueSetPosition {
  QueueSetPosition: { id: string; position: number }
}
export interface DeQueue {
  DeQueue: { id: string }
}
export type PlayerRequest = 'PlayerPause' | 'PlayerPlay'
export type LibraryRequest = 'GetLibrary'
type Request =
  | QueueRequest
  | QueueSetPosition
  | DeQueue
  | PlayerRequest
  | LibraryRequest

interface QueueItem {
  duration: number
  filepath: string
  id: string
  singer: string
  status: string
  title: string
}

interface LibraryItem {
  id: string
  title: string
  duration: number
}

export default function Room(props: RoomProps) {
  const { room, setRoom } = props

  const ws = useRef<WebSocket | null>(null)
  const [wsStatus, setWsStatus] = useState<'open' | 'closed'>('closed')
  const [queue, setQueue] = useState<QueueItem[]>()
  const [qSongId, setQSongId] = useState('')
  const [singer, setSinger] = useState(
    () => localStorage.getItem('singer') || 'nobody'
  )
  const [editSinger, setEditSinger] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<LibraryItem[]>([])
  const [library, setLibrary] = useState<LibraryItem[]>(() => [])
  const [showIdInput, setShowIdInput] = useState(false)
  const [showSearchInput, setShowSeachInout] = useState(false)
  const [ytSearchResulta, setYtSearchResults] = useState<YTSearchItem[]>([])

  function handleWsMessage(message: WebSocketEventMap['message']) {
    try {
      const data = JSON.parse(message.data)
      console.log('got ws data', data)
      if (data.queue) {
        setQueue(data.queue)
      } else if (data.library) {
        setLibrary(data.library)
        setSearchResults(data.library)
      }
    } catch (e) {
      console.warn(
        'onoz, caught error in handleWsMessage:',
        e,
        ' message:',
        message.data
      )
    }
  }

  function sendWsMessage(msg: Request) {
    ws.current && ws.current.send(JSON.stringify(msg))
  }

  function q(id: string) {
    sendWsMessage({
      Queue: {
        id,
        singer,
      },
    })
  }

  function deQ(id: string) {
    sendWsMessage({
      DeQueue: {
        id,
      },
    })
  }

  function qPosition(id: string, position: number) {
    sendWsMessage({
      QueueSetPosition: {
        id,
        position,
      },
    })
  }

  useEffect(() => {
    ws.current = new WebSocket(`ws://${room.href}`)
    ws.current.onopen = () => {
      setWsStatus('open')
      sendWsMessage('GetLibrary')
    }
    ws.current.onclose = () => setWsStatus('closed')
    ws.current.onmessage = handleWsMessage

    return () => {
      ws.current && ws.current.close()
    }
  }, [room.href])

  useEffect(() => {
    const fResults = library.filter((item) =>
      item.title.toLowerCase().includes(searchQ.toLowerCase())
    )
    setSearchResults(fResults)
    document.getElementById('search-results-container')?.scrollIntoView()
    debounceYtSearch(searchQ)
  }, [library, searchQ])

  function ytSearch(q: string) {
    youtubeSearch(q).then((results) => setYtSearchResults(results))
  }
  const debounceYtSearch = useCallback(debounce(ytSearch, 2500), [])

  return (
    <div className="box">
      <h1 className="room-heading">{room.name}</h1>
      {wsStatus === 'closed' ? (
        <div className="list">
          * * * disconnected * * *
          <ol>
            <li className="list-btn" onClick={() => setRoom(undefined)}>
              exit room
            </li>
          </ol>
        </div>
      ) : (
        <div className="list">
          <h2>- - - MENU - - -</h2>
          <ol>
            <li tabIndex={0}>
              {showIdInput ? (
                <div className="flex">
                  <input
                    type="text"
                    placeholder="queue song ID"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        q(qSongId)
                        setQSongId('')
                      } else if (e.key === 'Escape') {
                        setQSongId('')
                        setShowIdInput(false)
                      }
                    }}
                    value={qSongId}
                    onChange={(e) => setQSongId(e.target.value)}
                    autoFocus
                  />
                  <div
                    className="invert-list-btn"
                    onClick={() => setShowIdInput(false)}
                  >
                    {' '}
                    x{' '}
                  </div>
                </div>
              ) : (
                <div className="list-btn" onClick={() => setShowIdInput(true)}>
                  queue song ID
                </div>
              )}
            </li>
            <li tabIndex={0}>
              <div className="sticky">
                {showSearchInput ? (
                  <div className="search-q">
                    <input
                      className={showSearchResults ? 'search-q-input' : ''}
                      type="text"
                      placeholder="search"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowSearchResults(false)
                          setShowSeachInout(false)
                        }
                      }}
                      onFocus={() => setShowSearchResults(true)}
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      autoFocus
                    />
                    {showSearchResults && (
                      <div
                        className="invert-list-btn"
                        onClick={() => {
                          setSearchQ('')
                          setShowSearchResults(false)
                          setShowSeachInout(false)
                        }}
                      >
                        {' '}
                        x{' '}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="list-btn"
                    onClick={() => setShowSeachInout(true)}
                  >
                    {' '}
                    search/browse{' '}
                  </div>
                )}
              </div>
              {showSearchResults && (
                <div id="search-results-container">
                  {searchResults.length || ytSearchResulta.length ? (
                    <>
                      <h3 className="center">
                        - - - {searchQ ? 'local results' : 'browse'} - - -
                      </h3>
                      <ol className="search-results">
                        {searchResults.map((r) => (
                          <li
                            className="list-btn"
                            onClick={() => q(r.id)}
                            key={`result${r.id}`}
                          >
                            {r.title}
                          </li>
                        ))}
                      </ol>

                      {ytSearchResulta.length > 0 && (
                        <>
                          <h3 className="center">
                            - - - youtube results - - -
                          </h3>
                          <ol className="search-results">
                            {ytSearchResulta.map((item) => (
                              <li
                                className="list-btn"
                                onClick={() => q(item.id.videoId)}
                                key={`ytresult${item.id.videoId}`}
                              >
                                <div className="flex">
                                  <div className="img-container">
                                    <img
                                      src={item.snippet.thumbnails.default.url}
                                    />
                                  </div>

                                  {item.snippet.title}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </>
                      )}

                      <h3 className="center">- - - - - - - - - -</h3>
                    </>
                  ) : (
                    'no search results'
                  )}
                </div>
              )}
            </li>

            <li tabIndex={0} onClick={() => setEditSinger(true)}>
              {editSinger ? (
                <div className="flex">
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        localStorage.setItem('singer', singer)
                        setEditSinger(false)
                      } else if (e.key === 'Escape') {
                        setEditSinger(false)
                      }
                    }}
                    autoFocus
                    onBlur={() => setEditSinger(false)}
                    value={singer}
                    onChange={(e) => setSinger(e.target.value)}
                  />
                  <div
                    className="invert-list-btn"
                    onClick={() => {
                      setEditSinger(false)
                    }}
                  >
                    {' '}
                    x{' '}
                  </div>
                </div>
              ) : (
                <div className="list-btn">singer: {singer}</div>
              )}
            </li>
            <li tabIndex={0} onClick={() => sendWsMessage('PlayerPause')}>
              <div className="list-btn">pause</div>
            </li>
            <li tabIndex={0} onClick={() => sendWsMessage('PlayerPlay')}>
              <div className="list-btn">play</div>
            </li>
            <li tabIndex={0} onClick={() => setRoom(undefined)}>
              <div className="list-btn">exit</div>
            </li>
          </ol>

          {queue !== undefined && (
            <>
              <h2>- - - QUEUE - - -</h2>
              {queue.length === 0 && 'queue is empty...'}
              <ol>
                {queue.map((q, idx) => (
                  <li key={q.id} tabIndex={0}>
                    <div className="q-singer flex">
                      <div className="flex-grow">{q.singer}</div>

                      {idx > 1 && (
                        <div
                          className="list-btn-1char"
                          onClick={() => qPosition(q.id, idx - 1)}
                          title="move one UP in queue"
                        >
                          {' '}
                          &uarr;{' '}
                        </div>
                      )}

                      {idx !== 0 && idx + 1 < queue.length && (
                        <div
                          className="list-btn-1char"
                          onClick={() => qPosition(q.id, idx + 1)}
                          title="move one DOWN in queue"
                        >
                          {' '}
                          &darr;
                        </div>
                      )}

                      <div
                        className="list-btn-1char"
                        onClick={() => deQ(q.id)}
                        title="REMOVE from queue"
                      >
                        {' '}
                        x{' '}
                      </div>
                    </div>
                    <div>
                      {q.status === 'Downloading' ? 'downloading...' : q.title}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  )
}
