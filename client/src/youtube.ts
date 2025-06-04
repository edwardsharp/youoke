const YT_API_KEY = 'AIzaSyBRCfrDIH2BmDoYz7f-lwAnEi1Dw1yYC_M'

export interface SearchResult {
  items: YTSearchItem[]
  etag: string
  kind: string
  nextPageToken: string
  pageInfo: PageInfo
  regionCode: string
}
export interface PageInfo {
  totalResults: number
  resultsPerPage: number
}
export interface YTSearchItem {
  kind: string
  etag: string
  id: Id
  snippet: Snippet
}
export interface Id {
  kind: string
  videoId: string
}
export interface Snippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Thumbnails
  channelTitle: string
  liveBroadcastContent: string
  publishTime: string
}
export interface Thumbnails {
  default: DefaultOrMediumOrHigh
  medium: DefaultOrMediumOrHigh
  high: DefaultOrMediumOrHigh
}
export interface DefaultOrMediumOrHigh {
  url: string
  width: number
  height: number
}

export default function youtubeSearch(
  q: string,
  maxResults: number = 3,
  pageToken: string | null = null
): Promise<SearchResult | null> {
  if (!q || q.length === 0) {
    console.log('no search q, gonna return []')
    return Promise.resolve(null)
  }
  const params = new URLSearchParams({
    q,
    part: 'snippet',
    maxResults: maxResults.toString(),
    key: YT_API_KEY,
  })
  if (pageToken) params.set('pageToken', pageToken)

  return fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  )
    .then((response) => response.json())
    .then((result: SearchResult) => {
      console.log('zomg youtube resultz! data:', result)
      return result
    })
    .catch((error) => {
      console.warn('onoz! youtube search caught error:', error)
      return null
    })
}
