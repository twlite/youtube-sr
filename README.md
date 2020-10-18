# YouTube Search
Simple package to search data on YouTube.

# Note
Right now, this package only supports video search.

# Todo
- add more search type
- return better response
- typings
- tests
- better examples
- others

# Example

```js
const YouTube = require("../index");

YouTube.search("indila last dance", { limit: 1 })
    .then(x => console.log(x[0]))
    .catch(console.error);
```

## Response

```js
{
  id: 'K5KAc5CoCuk',
  url: 'https://www.youtube.com/watch?v=K5KAc5CoCuk',
  title: 'Indila - Dernière Danse (Clip Officiel)',
  description: '1er Album « Mini World » sur iTunes http://po.st/MiniWorld Facebook : https://www.facebook.com/IndilaOfficiel Twitter ...',
  duration: 215000,
  thumbnail: {
    url: 'https://i.ytimg.com/vi/K5KAc5CoCuk/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBBognlttPrCx9VCmx6P_nSW2LREw',
    height: 404,
    width: 720
  },
  channel: {
    id: 'UCX4EBb-NmxyntI0mQAErHvQ',
    name: 'Indila',
    url: 'https://www.youtube.com/channel/UCX4EBb-NmxyntI0mQAErHvQ',
    icon: {
      url: 'https://yt3.ggpht.com/a-/AOh14Gi6koQ6T4zRygJAQ2yLHRvj7j7HqRIQKIzGTA=s68-c-k-c0x00ffffff-no-rj-mo',
      width: 68,
      height: 68
    }
  },
  uploadedAt: '6 years ago',
  views: '671726079',
  type: 'video'
}
```

# Join my discord server
**[https://discord.gg/2SUybzb](https://discord.gg/2SUybzb)**