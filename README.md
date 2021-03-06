<img src='./assets/Aoba.png' width='150' height='150' align='left' style='float: left; margin: 0 10px 0 0;' alt='Aoba' />

# Aoba
[![Discord](https://discordapp.com/api/guilds/382725233695522816/embed.png)](https://discord.gg/yDnbEDH) [![Donate on Patreon](https://img.shields.io/badge/patreon-auguwu-blue.svg?logo=patreon&logoWidth=30&logoColor=F96854&style=popout-square)](https://patreon.com/auguwu)

> :speedboat: **| Discord bot to send push notifications from various sites.**

## Features
- View information from different services (Twitter, YouTube, Mixer, Picarto.tv, etc)

## Branch Details
- [master](https://github.com/nowoel/Aoba/tree/stable) **~** Stable version of Aoba, mostly used in the Production bot
- [bleeding](https://github.com/nowoel/Aoba/tree/bleeding) **~** Cutting edge features that are unstable

## Installation
### Requirements
- Node.js
- MongoDB
- Redis 
- Git (**optional**)

### Setting up
- Clone the repository (``git clone https://github.com/nowoel/Aoba.git``) or if you don't have Git, just go to "Clone or download" and click "Download ZIP" then extract
- Go into the root directory (``cd Aoba``) and install of the required dependencies (NPM comes with Node.js): ``npm install``
- Create a `config.json` file in the `src` directory of the bot and fill out the [example](https://github.com/nowoel/Aoba#example-config)
- Compile TypeScript (``npm run build``)
- Go into the `build` directory and run `bot.js`
  - If you get an error saying "Missing `config.json`," use the following commands for your machine:
    - Windows: `copy src/config.json build/config.json`
    - Unix: `cp src/config.json build/config.json`
    - Or you can use `npm run move:[unix/win]` or `yarn move:[unix/win]` without typing the commands manually

### Example Config
```js
{
  // Database URL for MongoDB
  "databaseUrl": "",

  // The bot's environment
  "environment": "",

  // Discord config
  "discord": {
    // The token to authenicate with Discord
    "token": "",

    // A list of prefixes to use, for mentions,
    // add "$(mention)" to the array
    // NOTE: The first element in this array should be
    // the default prefix
    "prefixes": []
  },

  // Redis config
  "redis": {
    // The host of the Redis server (default: localhost)
    "host": "",

    // The port of the Redis server (default: 6379)
    "port": 6379,

    // The database number (default: 0)
    "db": 0
  },

  // API Keys for different sources
  // NOTE: If the API key is null/undefined,
  // the services will not run!
  "keys": {
    "youtube": "",
    "twitch": "",
    "mixer": ""
  }
}
```

## LICENSE
Aoba is released under the **MIT** License. View [here](/LICENSE) for more details.

Icon and character is not made by me, credit to the original authors.