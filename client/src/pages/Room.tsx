import React, { useEffect, useRef, useState } from 'react'

import './Room.css'

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

export type PlayerRequest = 'PlayerPause' | 'PlayerPlay'
export type LibraryRequest = 'GetLibrary'
type Request = QueueRequest | PlayerRequest | LibraryRequest

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

const DEFAULT_LIBRARY: LibraryItem[] = [
    {
        duration: 287,
        id: 'wym88qdSuYM',
        title: 'Front 242 – Headhunter (karaoke)',
    },
    {
        duration: 386,
        id: 'SmDlLPwT5AI',
        title: 'Ministry  - Everyday Is Halloween (karaoke)',
    },
    {
        duration: 343,
        id: '1TIeDbnzp9M',
        title: 'George Michael - Careless Whisper (Karaoke Version)',
    },
    {
        duration: 267,
        id: 'XCkiLSReVoA',
        title: 'The Wild Boys - Duran Duran | Karaoke Version | KaraFun',
    },
    {
        duration: 245,
        id: '43Zws6N_xbI',
        title: 'Rihanna  Stay Karaoke',
    },
]

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
    const [library, setLibrary] = useState<LibraryItem[]>(() => DEFAULT_LIBRARY)

    function handleWsMessage(message: WebSocketEventMap['message']) {
        try {
            const data = JSON.parse(message.data)
            console.log('got ws data', data)
            if (data.queue) {
                setQueue(data.queue)
            } else if (data.library) {
                console.log('zomg gonna setLibrary!!')
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

    return (
        <div className="box">
            <h1 className="room-heading">{room.name}</h1>
            {wsStatus === 'closed' ? (
                <div className="list">
                    * * * disconnected * * *
                    <ol>
                        <li
                            className="list-btn"
                            onClick={() => setRoom(undefined)}
                        >
                            exit room
                        </li>
                    </ol>
                </div>
            ) : (
                <div className="list">
                    <h2>- - - MENU - - -</h2>
                    <ol>
                        <li tabIndex={0} className="list-no-pad">
                            <input
                                type="text"
                                placeholder="queue song ID"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        q(qSongId)
                                        setQSongId('')
                                    }
                                }}
                                value={qSongId}
                                onChange={(e) => setQSongId(e.target.value)}
                            />
                        </li>
                        <li tabIndex={0} className="list-no-pad">
                            <div className="sticky search-q">
                                <input
                                    className={
                                        showSearchResults
                                            ? 'search-q-input'
                                            : ''
                                    }
                                    type="text"
                                    placeholder="search"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const fResults = library.filter(
                                                (item) =>
                                                    item.title
                                                        .toLowerCase()
                                                        .includes(
                                                            searchQ.toLowerCase()
                                                        )
                                            )
                                            console.log('fResults', fResults)
                                            setSearchResults(fResults)
                                            setShowSearchResults(true)
                                            document
                                                .getElementById(
                                                    'search-q-header'
                                                )
                                                ?.scrollIntoView()
                                        }
                                    }}
                                    onFocus={() => setShowSearchResults(true)}
                                    value={searchQ}
                                    onChange={(e) => setSearchQ(e.target.value)}
                                />
                                {showSearchResults && (
                                    <div
                                        className="list-btn"
                                        onClick={() =>
                                            setShowSearchResults(false)
                                        }
                                    >
                                        {' '}
                                        x{' '}
                                    </div>
                                )}
                            </div>
                            {showSearchResults && (
                                <div className="search-results-container">
                                    {searchResults.length ? (
                                        <>
                                            <h3
                                                id="search-q-header"
                                                className="list-btn center"
                                            >
                                                - - -{' '}
                                                {searchQ ? 'results' : 'browse'}{' '}
                                                - - -
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
                                            <h3>- - - - - - - - - -</h3>
                                        </>
                                    ) : (
                                        'no search results'
                                    )}
                                </div>
                            )}
                        </li>

                        <li
                            className="list-btn"
                            tabIndex={0}
                            onClick={() => setEditSinger(true)}
                        >
                            {editSinger ? (
                                <input
                                    type="text"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            localStorage.setItem(
                                                'singer',
                                                singer
                                            )
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
                            ) : (
                                <>singer: {singer}</>
                            )}
                        </li>
                        <li
                            className="list-btn"
                            tabIndex={0}
                            onClick={() => sendWsMessage('PlayerPause')}
                        >
                            pause
                        </li>
                        <li
                            className="list-btn"
                            tabIndex={0}
                            onClick={() => sendWsMessage('PlayerPlay')}
                        >
                            play
                        </li>
                        <li
                            className="list-btn"
                            tabIndex={0}
                            onClick={() => setRoom(undefined)}
                        >
                            exit
                        </li>
                    </ol>

                    {queue !== undefined && (
                        <>
                            <h2>- - - QUEUE - - -</h2>
                            {queue.length === 0 && 'queue is empty...'}
                            <ol>
                                {queue.map((q) => (
                                    <li key={q.id} tabIndex={0}>
                                        <div className="q-singer">
                                            {q.singer}
                                        </div>
                                        <div>
                                            {q.status === 'Downloading'
                                                ? 'downloading...'
                                                : q.title}
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
