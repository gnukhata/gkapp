# [GKApp - GNUKhata Progressive Web App](https://gitlab.com/gnukhata/gkapp)

[![version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://gitlab.com/gnukhata/gkapp) [![license](https://img.shields.io/badge/license-AGPLv3-blue.svg)](https://gitlab.com/gnukhata/gkapp)

**GKApp** is a Progressive Web App made using Vue & Bootstrap.

- Free & Open Source under AGPLv3 License
- PWA/SPA — Single page app
- Built with Vuejs & Bootstrap Vue
- SCSS sources with variables

## Table of Contents

- [Description & Demo](#description--demo)
- [Quick Start](#quick-start)
- [Licensing](#licensing)
- [Useful Links](#useful-links)

## Description & Demo

#### Demo Instance

https://gnukhata.gitlab.io/gkapp

## Quick Start

#### Get the repo

- [Clone from Gitlab](https://gitlab.com/gnukhata/gkapp)

#### Install

`cd` to project's dir and run `npm install` which installs the required dependencies

#### Development

To pre-compile & hot-reload for development run `npm run serve`

To generate the translations: `npm run translate-extract` & then run `npm run translate-compile`

#### Build

- Production-ready with minified bundle `npm run build`.

<!-- - By default app is served from site's root `/`. To change the url, Set the `GKAPP_URL` environment variable to your custom domain. -->

- The default `gkcore` server url is `localhost:6543`, It can changed by setting environmental
  variable `VUE_APP_GKCORE_URL` to your preferred url before building the app.

Example:

```sh
export VUE_APP_GKCORE_URL=https://gkcore.example.com
npm run build
```

## Configuration

After building, You can customize gkapp with `gkapp-config.json` located in the `public` dir, It helps customizing some aspects of gkapp. Useful for
those who self host an instance of GNUKhata.

Default config:

```json
{
  "gkcore_url": "http://localhost:6543",
  "login_banner": {
    "show": false,
    "variant": "info",
    "content": "This text appears in the login screen"
  },
  "sidebar_banner": {
    "show": false,
    "variant": "info",
    "content": "This text appears inside the sidebar, after the user is logged in"
  }
}
```

## License

- Gkapp is Licensed under `AGPLv3`

![AGPLv3](public/img/agpl3.png)

## Useful Links

- [GNUKhata](https://gnukhata.org/)
- [GNUKhata Wiki](https://gitlab.com/gnukhata/gkapp/-/wikis/home)
- [Vue.js](https://vuejs.org)
- [Vue CLI](https://cli.vuejs.org)
- [Bootstrap Vue](https://bootstrap-vue.org)
