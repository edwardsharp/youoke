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
        <h2>important! you're using "https://"</h2>
        <h3>
          so you need to manually type the <b>"http://"</b> part of
          "http://youoke.party"
        </h3>
        <p>
          <em>...which is anoying (sorry)</em> if you're using a room with https
          support, you can ignore this!
        </p>
      </div>
    )
  )
}
