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
- [Contribution](#contribution)
- [Useful Links](#useful-links)

## Description & Demo

#### Demo Instance

https://try.gnukhata.org

## Quick Start

#### Requirements

- Nodejs `v18.x.x` (You could use [nvm](https://github.com/nvm-sh/nvm) for managing node versions)

#### Install

`cd` to project's dir and run `npm install` which installs the required dependencies

#### Development

To pre-compile & hot-reload for development run `npm run serve`

If you encounter below error like this, Linux/Mac users can `export NODE_OPTIONS=--openssl-legacy-provider`. [more info](https://stackoverflow.com/questions/74726224/opensslerrorstack-error03000086digital-envelope-routinesinitialization-e)

If you encounter below error like this, for
Windows cmd prompt use `set NODE_OPTIONS=--openssl-legacy-provider` &
Windows powershell use `$env:NODE_OPTIONS = "--openssl-legacy-provider`. [more info](https://stackoverflow.com/questions/74726224/opensslerrorstack-error03000086digital-envelope-routinesinitialization-e)

```sh
  at FSReqCallback.readFileAfterClose [as oncomplete] (node:internal/fs/read_file_context:68:3) {
  opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
}

```

To generate the translations: `npm run translate-extract` & then run `npm run translate-compile`

`vue-getext` is the translations library. Link can be found in the Useful Links section below

#### Build

- Production-ready with minified bundle `npm run build`.

## Configuration

To customize gkapp, create a new file named `.env.local` by copying the `.env` file in this repo and make necessary changes.

## License

Gkapp is Licensed under `AGPLv3`

![AGPLv3](public/img/agpl3.png)

## Contribution

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

Any contribution to the gkapp will be licensed under AGPLv3

## Useful Links

- [GNUKhata](https://gnukhata.org/)
- [GNUKhata Wiki](https://gitlab.com/gnukhata/gkapp/-/wikis/home)
- [Vue CLI](https://cli.vuejs.org)
- [Vue.js](https://vuejs.org)
- [Vue.js 2 Tutorial (youtube playlist)](https://www.youtube.com/playlist?list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa)
- [Bootstrap Vue](https://bootstrap-vue.org)
- [vue-gettext](https://github.com/Polyconseil/vue-gettext)
