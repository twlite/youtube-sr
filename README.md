# YouTube Search
Simple package to search videos or channels on YouTube.

# Features
- Easy
- Simple
- Fast
- Both scraper & api support
- Single api for both scraper & api methods

# Installation
## Node

```sh
$ npm i youtube-sr
```

```js
const YouTube = require("youtube-sr").default;
```

-------------------------------------------------------------------------------------------------

# Example

> Note: Data might be different for API search & Scraper Search

## Search

```js
YouTube.search("indila last dance", { limit: 3 })
    .then(x => console.log(x))
    .catch(console.error);
```

## Safe Search

```js
YouTube.search("indila last dance", { limit: 3, safeSearch: true })
    .then(x => console.log(x))
    .catch(console.error);
```

## API method

```js
// This is how you enable API mode. If you want to disable API mode, set api to false or use YouTube.delete("api")
YouTube.set("api", "YOUR_YOUTUBE_API_KEY");

// regular method
YouTube.search("indila last dance", { limit: 3 })
    .then(x => console.log(x))
    .catch(console.error);
```

# API
## search(query, options?)
Used to search videos/channels/playlists.

## searchOne(query, options?)
Similar to search but makes single search.

## getPlaylist(query, options?)
Returns playlist info.

## getVideo(url, options?)
Returns basic video info.

## validate(src, type)
Used to validate url/id.

## Response Example

```js
[
  Video {
    id: 'K5KAc5CoCuk',
    title: 'Indila - Dernière Danse (Clip Officiel)',
    description: 'Compositeurs: ',
    durationFormatted: '3:35',
    duration: 215000,
    uploadedAt: '7 years ago',
    views: 714624838,
    thumbnail: Thumbnail {
      id: 'K5KAc5CoCuk',
      width: 720,
      height: 404,
      url: 'https://i.ytimg.com/vi/K5KAc5CoCuk/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBBognlttPrCx9VCmx6P_nSW2LREw'
    },
    channel: Channel {
      name: 'Indila',
      verified: true,
      id: 'UCX4EBb-NmxyntI0mQAErHvQ',
      url: 'https://www.youtube.com/channel/UCX4EBb-NmxyntI0mQAErHvQ',
      icon: [Object],
      subscribers: null
    },
    likes: 0,
    dislikes: 0,
    live: false,
    private: false,
    tags: []
  },
  Video {
    id: '1ox1GvNiwtc',
    title: 'Indila - dernière danse (last dance) english lyrics',
    description: 'If you liked this beautiful song, then mind an leave a thumbs up, and hit "Subscribe" for more videos,and share to make our videos ...',
    durationFormatted: '3:33',
    duration: 213000,
    uploadedAt: '6 years ago',
    views: 2004026,
    thumbnail: Thumbnail {
      id: '1ox1GvNiwtc',
      width: 720,
      height: 404,
      url: 'https://i.ytimg.com/vi/1ox1GvNiwtc/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDVTH3SyGIvvPWm-zcDT3X1uEZ7cQ'
    },
    channel: Channel {
      name: 'Freegs Box',
      verified: false,
      id: 'UCzgz8LIN-qjjVEqjKWGktiw',
      url: 'https://www.youtube.com/user/medpks',
      icon: [Object],
      subscribers: null
    },
    likes: 0,
    dislikes: 0,
    live: false,
    private: false,
    tags: []
  },
  Video {
    id: 'UN4VLmo1QG4',
    title: 'Indila - Dernière Danse (Lyrics)',
    description: 'I take requests just comment! Artist: ',
    durationFormatted: '3:32',
    duration: 212000,
    uploadedAt: '11 months ago',
    views: 1843719,
    thumbnail: Thumbnail {
      id: 'UN4VLmo1QG4',
      width: 720,
      height: 404,
      url: 'https://i.ytimg.com/vi/UN4VLmo1QG4/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDCaFr-i5MJrLSlclRRKSliEJ33lw'
    },
    channel: Channel {
      name: 'Audioandlyrics',
      verified: false,
      id: 'UChWcegNjI5qZV-8jBgFAJ6A',
      url: 'https://www.youtube.com/channel/UChWcegNjI5qZV-8jBgFAJ6A',
      icon: [Object],
      subscribers: null
    },
    likes: 0,
    dislikes: 0,
    live: false,
    private: false,
    tags: []
  }
]
```

# Similar Packages
- **[youtube-ext](https://npmjs.com/package/youtube-ext)** YouTube Download, YouTube Search
- **[ytsr](https://npmjs.com/package/ytsr)** YouTube Search
- **[ytpl](https://npmjs.com/package/ytpl)** YouTube Playlist
- **[ytdl-core](https://npmjs.com/package/ytdl-core)** YouTube Download
- **[simple-youtube-api](https://npmjs.com/package/simple-youtube-api)** YouTube API wrapper

# Join my discord server
**[https://discord.gg/2SUybzb](https://discord.gg/2SUybzb)**