# YouTube Search
Simple package to search data on YouTube.

# Note
Right now, this package supports video search only.

# Todo
- add more search type
- return better response
- typings
- tests
- better examples
- others

# Example

```js
const YouTube = require("youtube-sr");

YouTube.search("indila last dance", { limit: 1 })
    .then(x => console.log(x[0]))
    .catch(console.error);
```

## Response

```js
Video {
  id: 'K5KAc5CoCuk',
  title: 'Indila - Dernière Danse (Clip Officiel)',
  description: '1er Album « Mini World » sur iTunes http://po.st/MiniWorld Facebook : https://www.facebook.com/IndilaOfficiel Twitter ...',
  durationFormatted: '3:35',
  uploadedAt: '6 years ago',
  views: '672002671',
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
    icon: {
      url: 'https://yt3.ggpht.com/a-/AOh14Gi6koQ6T4zRygJAQ2yLHRvj7j7HqRIQKIzGTA=s68-c-k-c0x00ffffff-no-rj-mo',
      width: 68,
      height: 68
    }
  }
}
```

# Join my discord server
**[https://discord.gg/2SUybzb](https://discord.gg/2SUybzb)**