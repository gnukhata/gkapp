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

`cd` to project's dir and run `npm install`

#### Serve

To pre-compile & hot-reload for development run `npm run serve`

#### Build

- Production-ready with minified bundle `npm run build`.

- By default app is served from site's root `/`. To change the url, Set the `GKAPP_URL` environment variable to your custom domain.

- The default `gkcore` server url is `localhost:6543`, It can changed by setting environmental
  variable `VUE_APP_GKCORE_URL` to your preferred url.

Example:

```bash
export VUE_APP_GKCORE_URL=https://gkcore.example.com

export GKAPP_URL=https://example.com

npm run build
```

## Configuration

You can customize gkapp with `gkapp.config.js` which exposes few options. To apply the changes,
gkapp has to be built with `npm run build`

## License

- Gkapp is Licensed under `AGPLv3`

![AGPLv3](public/img/agpl3.png)

## Useful Links

- [GNUKhata](https://gnukhata.org/)
- [GNUKhata Wiki](https://gitlab.com/gnukhata/gkapp/-/wikis/home)
- [Vue.js](https://vuejs.org)
- [Vue CLI](https://cli.vuejs.org)
- [Bootstrap Vue](https://bootstrap-vue.org)
