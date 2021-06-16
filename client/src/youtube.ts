const YT_API_KEY = process.env.YT_API_KEY || 'AIzaSyBRCfrDIH2BmDoYz7f-lwAnEi1Dw1yYC_M'

export interface SearchResult {
  items: YTSearchItem[];
  etag: string;
  kind: string;
  nextPageToken: string;
  pageInfo: PageInfo;
  regionCode: string;
}
export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}
export interface YTSearchItem {
  kind: string;
  etag: string;
  id: Id;
  snippet: Snippet;
}
export interface Id {
  kind: string;
  videoId: string;
}
export interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
}
export interface Thumbnails {
  default: DefaultOrMediumOrHigh;
  medium: DefaultOrMediumOrHigh;
  high: DefaultOrMediumOrHigh;
}
export interface DefaultOrMediumOrHigh {
  url: string;
  width: number;
  height: number;
}

export default function youtubeSearch(q: string): Promise<YTSearchItem[]>{
  if(!q || q.length === 0){
    console.log('no search q, gonna return []')
    return Promise.resolve([])
  }
  const params = new URLSearchParams({
   q,
   part: "snippet",
   maxResults: '25',
   key: YT_API_KEY
  })

  return fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`)
  .then( response => response.json() )
  .then( (result: SearchResult) => {
    console.log('zomg youtube resultz! data:',result)
    return result.items
  }).catch( error => {
    console.warn('onoz! youtube search caught error:',error)
    return []
  })
}
