# YouTube Search
Simple package to make YouTube search.

# Features
- Easy
- Simple
- Fast
- Lightweight

# Supported
- ✅ Regular YouTube Search (Video/Channel/Playlist) (~25 items)
- ✅ Get specific video
- ✅ Get homepage contents
- ✅ Get Playlist (including all videos)
- ✅ YouTube safe search
- ✅ YouTube Trending (~50 items)
- ❌ Get specific channel
- ❌ Get full search result
- ❌ YouTube search filters
- ❌ Downloading videos

# Installation
## Node

> You may have to install `fetch` api in node. `youtube-sr` supports **[undici](https://npmjs.com/package/undici)** and **[node-fetch](https://npmjs.com/package/node-fetch)**.

```sh
$ npm i --save youtube-sr
```

```js
const YouTube = require("youtube-sr").default;
```

-------------------------------------------------------------------------------------------------
## Deno

```js
import YouTube from "https://deno.land/x/youtube_sr/mod.ts";
```
-------------------------------------------------------------------------------------------------

# Example
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

# API
## search(query, options?)
Used to search videos/channels/playlists. This works like a general YouTube search.

```js
YouTube.search("the weeknd save your tears")
    .then(console.log) // Response[]
    .catch(console.error);
```

## searchOne(query, ...options?)
Similar to search but makes single search.

```js
YouTube.search("the weeknd save your tears")
    .then(console.log) // Response
    .catch(console.error);
```

## getPlaylist(query, options?)
Returns playlist info.
> Note: Data returned by `getPlaylist` is different from the playlist data obtained by `search`.
> **Using `limit` in `options` wont fetch all videos. They are for current chunk only!

**Basic**
```js
YouTube.getPlaylist("some_youtube_playlist")
  .then(console.log) // max 100 items
  .catch(console.error);
```

**Getting all videos from a playlist at once**
```js
YouTube.getPlaylist("some_youtube_playlist")
  .then(playlist => playlist.fetch()) // if your playlist has 500 videos, this makes additional 4 requests to get rest of the 400 videos. (100 videos = 1 request)
  .then(console.log) // all parsable videos
  .catch(console.error);
```

**Lazily getting videos from a playlist**
```js
YouTube.getPlaylist("some_youtube_playlist")
  .then(playlist => playlist.next()) // fetches next 100 items
  .then(console.log) // all parsable videos
  .catch(console.error);
```

## getVideo(url, options?)
Returns basic video info by its url.

> Note: Data returned by `getVideo` is different from the `search`.

```js
YouTube.getVideo("Some_Video_URL")
  .then(console.log) // Video info
  .catch(console.error);
```

## homepage()
Returns videos from the YouTube homepage.

```js
YouTube.homepage()
  .then(console.log) // videos from youtube homepage
  .catch(console.error);
```

## trending()
Returns trending videos from the YouTube.

```js
YouTube.trending()
  .then(console.log) // trending videos from youtube
  .catch(console.error);
```

## getSuggestions(query)
Returns youtube search suggestions.

```js
YouTube.getSuggestions("alan walker")
  .then(console.log);

/*
[
  'alan walker',
  'alan walker songs',
  'alan walker faded',
  'alan walker alone',
  'alan walker remix',
  'alan walker spectre',
  'alan walker on my way',
  'alan walker new song',
  'alan walker lily',
  'alan walker darkside',
  'alan walker pubg song',
  'alan walker ringtone',
  'alan walker ignite',
  'alan walker live'
]
*/
```

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

# Testing website
- Source **[https://github.com/DevAndromeda/simple-youtube-clone](https://github.com/DevAndromeda/simple-youtube-clone)**
- Preview **[https://simple-youtube-clone.vercel.app](https://simple-youtube-clone.vercel.app)**

# Help and Support
Join my discord server **[https://discord.gg/YnUMMCDvSJ](https://discord.gg/YnUMMCDvSJ)**