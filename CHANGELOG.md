# Changelog

## [0.10.0](https://github.com/vuon9/devtoolbox/compare/v0.9.4...v0.10.0) (2026-05-21)


### Features

* add --server-only mode and air hot reload for backend development ([#71](https://github.com/vuon9/devtoolbox/issues/71)) ([967b83c](https://github.com/vuon9/devtoolbox/commit/967b83c3c85a43330bd356d2649e78678ae17743))
* add custom title bar with platform-specific controls ([#40](https://github.com/vuon9/devtoolbox/issues/40)) ([e460f86](https://github.com/vuon9/devtoolbox/commit/e460f86569ae3423f3e6c105693d91ed8f00118d))
* add new services (encoder/encrypter/hash/code-converter/text-utilities), HTTP client generator, E2E tests, CI pipeline, dual-mode transport ([#72](https://github.com/vuon9/devtoolbox/issues/72)) ([2b8efad](https://github.com/vuon9/devtoolbox/commit/2b8efadfc360200538587240940d97b7c8f50eb7))
* Browser API support ([#38](https://github.com/vuon9/devtoolbox/issues/38)) ([a163b16](https://github.com/vuon9/devtoolbox/commit/a163b1675ddb5249d6423c2fb14a5b3bfc04a73a))
* dual-palette theme system with JSON themes + user theme loading ([#75](https://github.com/vuon9/devtoolbox/issues/75)) ([36c5639](https://github.com/vuon9/devtoolbox/commit/36c5639dfc5dbb44a5117b64503170a0444b492c))
* enhance RegExpTester with live highlighting and improved UX ([#41](https://github.com/vuon9/devtoolbox/issues/41)) ([06b3749](https://github.com/vuon9/devtoolbox/commit/06b3749c6e1c50ce7ee8ad37d138ed0a6bbf588d))
* Spotlight command palette, sidebar settings gear, and UI improvements ([#57](https://github.com/vuon9/devtoolbox/issues/57)) ([8094887](https://github.com/vuon9/devtoolbox/commit/8094887a413b1139776fc7d53262b3c2b3302d49))


### Bug Fixes

* **ci:** add system deps + limit govulncheck to ./internal/... ([ce63f39](https://github.com/vuon9/devtoolbox/commit/ce63f390727d262df322edb63dbf243bc7604ef7))
* **ci:** govulncheck text mode - skip broken SARIF upload ([6007ccd](https://github.com/vuon9/devtoolbox/commit/6007ccd2dd3ab952d0c13cd8e37ded2275ce809b))
* command palette navigation and reduce window height ([#67](https://github.com/vuon9/devtoolbox/issues/67)) ([d78a5f8](https://github.com/vuon9/devtoolbox/commit/d78a5f837675b762d0ea6f6b28a5e10b41d83d2d))
* remove invalid vendor prop from dependabot.yml ([939111d](https://github.com/vuon9/devtoolbox/commit/939111dd7fc0916aad516661fb5edefb50c3a368))
* resolve 8 dependabot security alerts + add automated dep mgmt ([534a08e](https://github.com/vuon9/devtoolbox/commit/534a08e4082ab2cd8fc2af4d1a35dd1087774ce6))
* resolve 8 dependabot security alerts + automated dependency management ([5fa0d43](https://github.com/vuon9/devtoolbox/commit/5fa0d43cf086db5cec789ea1868e33125cd16e02))
* resolve 8 dependabot security alerts + automated dependency management ([#76](https://github.com/vuon9/devtoolbox/issues/76)) ([5fa0d43](https://github.com/vuon9/devtoolbox/commit/5fa0d43cf086db5cec789ea1868e33125cd16e02))
* resolve codeformatter test failures and compilation errors ([#53](https://github.com/vuon9/devtoolbox/issues/53)) ([4d8524a](https://github.com/vuon9/devtoolbox/commit/4d8524a4465b389e572cb67064662ad9655ca3dd))
* restore compatible Wails version ([18394f1](https://github.com/vuon9/devtoolbox/commit/18394f1deb712912dcb1c80f8ed6c3bb795c64d1))
* revert Wails to v3.0.0-alpha.88 ([b69f46d](https://github.com/vuon9/devtoolbox/commit/b69f46de9e05f0d51d64abdfe451aae62d653031))
* stabilize editor e2e flows ([6873315](https://github.com/vuon9/devtoolbox/commit/6873315b78105856e01c0fda76bb0a6ae48331ed))
