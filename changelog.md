# Changelog

## [0.7.0] - 24.03.2021

### Added
 - Test setup with coverage report (#30)
 - An option to the luna.config.js to exclude dependencies from the api build (#29)

## Changed
 - Put the cli and the base framework back into the same monorepo, but in different (npm) packages (#30)
 - **BREAKING**: If something is imported directly from the `lib/packages` directory, the `packages` part must be omitted
 - Sorting routes and setting route parameters is now done by the cli in the build step (#32)
 - **BREAKING**: Cleaned up luna.config.js (#25)

## [0.6.0] - 15.03.2021

### Added
 - Concept for middleware for specific routes (#21)
 - Route based caching (#24)

### Changed
 - Allow multiple dynamic route params
 - **BREAKING**: renamed moon-js to luna-js to prevent naming clash
    - MoonElement -> LunaElement
    - MoonDownElement -> LunaMarkdownElement
    - moon.config.js -> luna.config.js
    - import * from '@webtides/moon-js' -> import * from '@webtides/luna-js'
    - `moon` cli command is now `luna`
 - **BREAKING**: postcss-plugins in luna.config.js must be a function returning an array

## [0.5.1] - 10.03.2021

### Fixed
 - Various bug fixes

## [0.5.0] - 10.03.2021

### Added
 - Configurable asset and api context path and domain (#17, #18)
 - Global luna-js config object for server and client (#13)

## [0.4.0] - 

### Added
 - Publishing to npm (#7)
 - Changelog
 
### Changed
 - `postcssPlugins` in `moon.config.js` are now a function. that returns the plugins, instead of an array
 - Splitted project in a main package (`@webtides/moon-js`) and a cli package (`@webtides/moon-cli`) (#6)
 - Made page components work more close the same as other component (#9, #10)
 - Improved layout functionality (#4)
   - **BREAKING**: luna-js does not export layouts anymore directly
   - **BREAKING**: layouts now want two parameters: page & context

### Deprecated
 - `scripts`-area in custom layouts
