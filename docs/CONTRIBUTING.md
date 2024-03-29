# Contributor Guidelines

All code contributions all licenced under `AGPLv3`

# Code

- `src/App.vue` is the entry point of the app

- `src/mixins` folder contains the global mixins code. Most of mixin methods use the `snake_case` convention to differentiate from the component specific methods

- `components/` contains re-usable code across the app

- `locales/` contain the translation files

- `router/` contain all the app routes

- `store/` contains the code which manages the app's state

- `views/` contain the matching view for routes

- We follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for writing commit messages

# Editor Plugins

## VSCode

Vetur plugin: https://marketplace.visualstudio.com/items?itemName=octref.vetur

## Neovim

Mason: Install `vetur-vls` and linter `prettier`

# Merge requests

Development happens on the `devel` branch. Create a feature branch from it, add your changes and make a merge request

> `master` branch is intended for stable code. Do not push changes to it.

# Release Strategy

Checklist:

1. Git checkout to master
2. merge commits from devel -> master
3. Wait for the ci/cd pipeline to finish. Make sure all jobs are successful
4. Create a Release / tag
