# YouTube Search
Simple package to search videos or channels on YouTube.

# Installation
## Node

```sh
$ npm i youtube-sr
```

-------------------------------------------------------------------------------------------------

## Deno

```js
import YouTube from "https://deno.land/x/youtube_sr/mod.ts";
```

-------------------------------------------------------------------------------------------------

## Web

```html
<!-- Recommended -->
<script type="module">
import YouTube from "https://cdn.skypack.dev/youtube-sr";
</script>
```

```html
<script src="https://raw.githubusercontent.com/DevSnowflake/youtube-sr/master/webpack/youtube-sr.js"></script>
```

-------------------------------------------------------------------------------------------------

# Example

```js
YouTube.search("indila last dance", { limit: 3 })
    .then(x => console.log(x))
    .catch(console.error);
```

# API
## search(query, options?)
## searchOne(query, options?)
## getPlaylist(query, options?)
## validate(src, type)

## Response Example

> **Note:** `subscribers` count is `null` for the channel objects received from `video` or `playlist`.

```js
[
    Video {
        id: 'K5KAc5CoCuk',
        title: 'Indila - Dernière Danse (Clip Officiel)',
        description: '1er Album « Mini World » sur iTunes http://po.st/MiniWorld Facebook : https://www.facebook.com/IndilaOfficiel Twitter ...',
        durationFormatted: '3:35',
        uploadedAt: '6 years ago',
        views: '673022078',
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
        }
    },
    Video {
        id: 'ZthUo-Z97uw',
        title: 'Indila - Parle à ta tête (Clip Officiel)',
        description: 'Indila',
        durationFormatted: '5:58',
        uploadedAt: '11 months ago',
        views: '26742156',
        thumbnail: Thumbnail {
            id: 'ZthUo-Z97uw',
            width: 720,
            height: 404,
            url: 'https://i.ytimg.com/vi/ZthUo-Z97uw/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBzYV0IZaeEQ84LWF6pRIna96zBKQ'
        },
        channel: Channel {
            name: 'Indila',
            verified: true,
            id: 'UCX4EBb-NmxyntI0mQAErHvQ',
            url: 'https://www.youtube.com/channel/UCX4EBb-NmxyntI0mQAErHvQ',
            icon: [Object],
            subscribers: null
        }
    },
    Video {
            id: 'vtNJMAyeP0s',
            title: 'Indila - Tourner Dans Le Vide',
            description: 'Indila',
            durationFormatted: '4:11',
            uploadedAt: '6 years ago',
            views: '185781927',
            thumbnail: Thumbnail {
                id: 'vtNJMAyeP0s',
                width: 720,
                height: 404,
                url: 'https://i.ytimg.com/vi/vtNJMAyeP0s/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLC9vHC4a3KiT0Jw6n5RQ5AzzHjWnA'
            },
            channel: Channel {
                name: 'Indila',
                verified: true,
                id: 'UCX4EBb-NmxyntI0mQAErHvQ',
                url: 'https://www.youtube.com/channel/UCX4EBb-NmxyntI0mQAErHvQ',
                icon: [Object],
                subscribers: null
            }
    }
]
```

# Join my discord server
**[https://discord.gg/2SUybzb](https://discord.gg/2SUybzb)**