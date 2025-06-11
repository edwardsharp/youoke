import { useEffect, useState } from 'react'

import './HttpNotice.css'

export function HttpsNotice() {
  const [isHttps, setIsHttps] = useState(false)
  useEffect(() => {
    setIsHttps(window.location.protocol === 'https:')
  }, [])

  return (
    isHttps && (
      <div className="notice">
        <h2>
          important! you're using <b>https://</b>*
        </h2>
        <h3>
          please switch to <b>http://</b>
        </h3>
        <h4>
          manually type the <b>"http://"</b> part of "http://youoke.party"
        </h4>
        <p>
          <b>*</b> your browser will not let you connect to non-https servers{' '}
          <em>
            ...which is anoying (sorry (but to browser's credit, security-wise,
            is a reasonable default))
          </em>
        </p>
        <p>
          if you're using a room with https support (or <b>localhost</b>), you
          can ignore this!{' '}
        </p>
      </div>
    )
  )
}
