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

https://gnukhata.gitlab.io/gkapp

## Quick Start

#### Requirements

- Nodejs `v16.18.0` (use [nvm](https://github.com/nvm-sh/nvm) for managing node versions)

#### Install

`cd` to project's dir and run `npm install` which installs the required dependencies

#### Development

Development happens on the `devel` branch.

To pre-compile & hot-reload for development run `npm run serve`

To generate the translations: `npm run translate-extract` & then run `npm run translate-compile`

`vue-getext` is the translations library. Link can be found in the Useful Links section below

#### Build

- Production-ready with minified bundle `npm run build`.

## Configuration

After building, You can customize gkapp with `gkapp-config.json`. Example config file is located in the `public` dir, It helps customizing some aspects of gkapp. Useful for
those who self host an instance of gkapp.

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
