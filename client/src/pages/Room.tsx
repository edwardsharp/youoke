import { useEffect, useRef, useState, useCallback } from 'react'
import debounce from 'lodash.debounce'

import './Room.css'
import youtubeSearch, { YTSearchItem } from '../youtube'
import { HttpsNotice } from './HttpsNotice'

export interface IRoom {
  name: string
  href: string
  code: string
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
export interface QueueSetSinger {
  QueueSetSinger: { id: string; singer: string }
}
export interface PlayerSetWallmessage {
  PlayerSetWallmessage: { wallmessage: string }
}
export type PlayerRequest = 'PlayerPause' | 'PlayerPlay' | 'PlayerSkip'
export type LibraryRequest = 'GetLibrary'
type Request =
  | QueueRequest
  | QueueSetPosition
  | QueueSetSinger
  | DeQueue
  | PlayerRequest
  | PlayerSetWallmessage
  | LibraryRequest

interface QueueItem {
  duration: number
  filepath: string
  id: string
  singer: string
  status: string
  title: string
  wallmessage: string
}

interface LibraryItem {
  id: string
  title: string
  duration: number
}

function QSinger(props: {
  qid: string
  singer: string
  qSinger: (id: string, singer: string) => void
}) {
  const { qid, singer, qSinger } = props

  const [renameSinger, setRenameSinger] = useState(false)
  const [newSinger, setNewSinger] = useState(singer)

  return (
    <div
      className="flex-grow"
      onClick={() => !renameSinger && setRenameSinger(true)}
    >
      {renameSinger ? (
        <div className="flex">
          <input
            type="text"
            value={newSinger}
            onChange={(e) => setNewSinger(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                qSinger(qid, newSinger)
                setRenameSinger(false)
              } else if (e.key === 'Escape') {
                setRenameSinger(false)
              }
            }}
          />

          <div
            className="invert-list-btn"
            onClick={() => setRenameSinger(false)}
          >
            {' '}
            x{' '}
          </div>
        </div>
      ) : (
        <div className="list-btn">{singer}</div>
      )}
    </div>
  )
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
  const [wallmessage, setWallmessage] = useState('')
  const [editWallMessage, setEditWallmessage] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<LibraryItem[]>([])
  const [library, setLibrary] = useState<LibraryItem[]>(() => [])
  const [showIdInput, setShowIdInput] = useState(false)
  const [showSearchInput, setShowSeachInout] = useState(false)
  const [ytSearchResulta, setYtSearchResults] = useState<YTSearchItem[]>([])
  const [ytNextPageToken, setYtNextPageToken] = useState('')

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

  function qSinger(id: string, singer: string) {
    sendWsMessage({
      QueueSetSinger: {
        id,
        singer,
      },
    })
  }

  function qWallMessage(wallmessage: string) {
    sendWsMessage({
      PlayerSetWallmessage: {
        wallmessage,
      },
    })
  }

  useEffect(() => {
    // console.log('zomg using ws url:', `${room.href}?code=${room.code}`)
    ws.current = new WebSocket(`${room.href}?code=${room.code}`)
    ws.current.onopen = () => {
      setWsStatus('open')
      sendWsMessage('GetLibrary')
    }
    ws.current.onclose = () => setWsStatus('closed')
    ws.current.onmessage = handleWsMessage

    return () => {
      ws.current && ws.current.close()
    }
  }, [room.href, room.code])

  useEffect(() => {
    const fResults = library.filter((item) =>
      item.title
        .toLowerCase()
        .includes(searchQ.toLowerCase().replace('karaoke', ''))
    )
    setSearchResults(fResults)
    document.getElementById('search-results-container')?.scrollIntoView()
    debounceYtSearch(searchQ)
  }, [library, searchQ, queue])

  function ytSearch(q: string) {
    youtubeSearch(q).then((results) => {
      setYtNextPageToken(results?.nextPageToken || '')
      setYtSearchResults(results?.items || [])
    })
  }
  const debounceYtSearch = useCallback(debounce(ytSearch, 2500), [])

  function ytSearchNextPage() {
    youtubeSearch(searchQ, 10, ytNextPageToken).then((results) => {
      setYtNextPageToken(results?.nextPageToken || '')
      setYtSearchResults((prev) => [...prev, ...(results?.items || [])])
    })
  }

  return (
    <div className="box">
      <h1 className="room-heading">{room.name}</h1>
      {wsStatus === 'closed' ? (
        <div className="list">
          * * * disconnected * * *
          <HttpsNotice />
          <ol>
            <li className="list-btn" onClick={() => location.reload()}>
              reload
            </li>
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
                    placeholder="youtube video ID or URL"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (/http/.test(qSongId)) {
                          console.log('oh, i guess is URL>>', qSongId)
                          try {
                            const url = new URL(qSongId)
                            const v = url.searchParams.get('v')
                            if (v) {
                              q(v)
                              setQSongId('')
                              return
                            }
                            if (/youtu\.be/.test(qSongId)) {
                              const path = url.pathname.replace('/', '')
                              if (path) {
                                q(path)
                                setQSongId('')
                                return
                              }
                            }
                          } catch (e) {
                            // :shrug:
                          }
                        }

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
                    <div className="flex-grow">
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
                      {!searchQ.match('karaoke') && (
                        <div
                          className="list-btn-1char search-q-input-tip"
                          onClick={() =>
                            setSearchQ((prev) => `${prev} karaoke`)
                          }
                        >
                          tip: add "karaoke" to the search query!
                        </div>
                      )}
                    </div>
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
                        {searchResults.map((r) => {
                          const isQueued = queue?.some((l) => l.id == r.id)
                          return (
                            <li
                              className={isQueued ? '' : 'list-btn'}
                              onClick={() => !isQueued && q(r.id)}
                              key={`result${r.id}`}
                            >
                              {isQueued && <span title="IT'S Q'D!">🎤</span>}{' '}
                              {r.title}
                            </li>
                          )
                        })}
                      </ol>

                      {ytSearchResulta.length > 0 && (
                        <>
                          <h3 className="center">
                            - - - youtube results - - -
                          </h3>
                          <ol className="search-results yt-results">
                            {ytSearchResulta.map((item) => {
                              const isQueued = queue?.some(
                                (l) => l.id == item.id.videoId
                              )
                              return (
                                <li
                                  className={isQueued ? '' : 'list-btn'}
                                  onClick={() =>
                                    !isQueued && q(item.id.videoId)
                                  }
                                  key={`ytresult${item.id.videoId}`}
                                >
                                  <div className="flex-responsive">
                                    <div className="img-container">
                                      <img
                                        src={
                                          item.snippet.thumbnails.default.url
                                        }
                                      />
                                    </div>
                                    {isQueued && (
                                      <span title="IT'S Q'D!">🎤</span>
                                    )}{' '}
                                    {item.snippet.title}
                                  </div>
                                </li>
                              )
                            })}

                            <li
                              onClick={() => ytSearchNextPage()}
                              className="list-btn"
                            >
                              load more youtube results
                            </li>
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

            <li
              tabIndex={0}
              onClick={() => {
                setWallmessage('')
                setEditWallmessage(true)
              }}
            >
              {editWallMessage ? (
                <div className="flex">
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditWallmessage(false)
                        qWallMessage(wallmessage)
                      } else if (e.key === 'Escape') {
                        setEditWallmessage(false)
                      }
                    }}
                    autoFocus
                    onBlur={() => setEditWallmessage(false)}
                    value={wallmessage}
                    onChange={(e) => setWallmessage(e.target.value)}
                    placeholder="show a message between songz"
                    maxLength={75}
                  />
                  <div
                    className="invert-list-btn"
                    onClick={() => {
                      setEditWallmessage(false)
                    }}
                  >
                    {' '}
                    x{' '}
                  </div>
                </div>
              ) : (
                <div className="list-btn">bumper message</div>
              )}
            </li>

            <li>
              <div className="controls">
                <div
                  tabIndex={0}
                  className="list-btn"
                  onClick={() => sendWsMessage('PlayerPause')}
                >
                  pause
                </div>
                <div
                  tabIndex={0}
                  className="list-btn"
                  onClick={() => sendWsMessage('PlayerPlay')}
                >
                  play
                </div>
                <div
                  tabIndex={0}
                  className="list-btn"
                  onClick={() => sendWsMessage('PlayerSkip')}
                >
                  skip
                </div>
              </div>
            </li>
            <li className="list-btn" onClick={() => setRoom(undefined)}>
              exit room
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
                      <QSinger qid={q.id} singer={q.singer} qSinger={qSinger} />

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

                      {idx == 0 ? (
                        <div title="CURRENTLY PLAYING">🎤</div>
                      ) : (
                        <div
                          className="list-btn-1char"
                          onClick={() => deQ(q.id)}
                          title="REMOVE from queue"
                        >
                          {' '}
                          x{' '}
                        </div>
                      )}
                    </div>
                    <div className="q-item-title">
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
