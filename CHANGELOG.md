# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.5] - 2024-03-14

### Changed

- Upgrade vulnerable dependency: xmldom (#2)


## [1.1.4] - 2017-10-10

### Added

- TravisCI integration
- logo image
- badges

### Fixed

- improve CLI documentation

### Changed

- upgrade developer dependency: mocha


## [1.1.3] - 2017-10-09

### Fixed

- improve CLI documentation


## [1.1.2] - 2017-10-09

### Fixed

- improve documentation for XPath usage


## [1.1.1] - 2017-10-09

### Added

- documentation for working with multiple namespaces

### Fixed

- improve error handling of bad namespaces argument
- improved tests for namespaces


## [1.1.0] - 2017-10-09

### Added

- ability to define `namespaces` to map prefixes to URIs
- command line interface
- `filterxml.version` property

### Changed

- *Breaking:* the main function requires new parameter: `namespaces`


## [1.0.0] - 2017-10-08

### Added

- main filterxml function
- linter tool
- mocha unit tests
- minimal documentation
