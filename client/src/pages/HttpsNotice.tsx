import { useEffect, useState } from 'react'

export function HttpsNotice() {
  const [isHttps, setIsHttps] = useState(false)
  useEffect(() => {
    setIsHttps(window.location.protocol === 'https:')
  }, [])

  return (
    isHttps && (
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
          should do that for you, which is, in some ways, understandable, but in
          other ways, infuriating 🤷)
        </p>
      </>
    )
  )
}
