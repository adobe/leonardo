# `@adobe/leonardo-ui`

[![license](https://img.shields.io/github/license/adobe/leonardo)](https://github.com/adobe/leonardo/blob/master/LICENSE) [![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-blueviolet)](https://github.com/adobe/leonardo/blob/master/.github/CONTRIBUTING.md)

The Leonardo tool UI, deployed at http://www.leonardocolor.io/

## Contributing

Contributions are welcomed! Read the [Contributing Guide](../../.github/CONTRIBUTING.md) for more information.

## Development

To get started developing Leonardo's UI:

```sh
# Install dependencies
yarn install

# Run local server
yarn dev
```

Then, visit the live reloading web UIs here:
http://localhost:1234/index.html
http://localhost:1234/theme.html
http://localhost:1234/scales.html
http://localhost:1234/tools.html

### Cross-package development

When making updates to `@adobe/leonardo-contrast-colors` while also developing the user interface, some issues may occur while linking the local dependancy. Follow these steps **every time you install or update an npm or yarn dependancy**:

1. Install your new dependancy

```sh
yarn install my-new-package
// or
npm install my-new-package
```

2. Delete the cache

```
leonardo/packages/ui/.cache
```

3. Link local Leonardo

```sh
cd packages/contrast-colors
npm link
cd ..
cd ui
npm link @adobe/leonardo-contrast-colors
```

If you do not properly remove the cache and re-link the local `@adobe/leonardo-contrast-colors` package, things won't work right.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
