# @js-nerds/browser-csv-txt-downloader

[![npm version](https://img.shields.io/npm/v/@js-nerds/browser-csv-txt-downloader)](https://www.npmjs.com/package/@js-nerds/browser-csv-txt-downloader)
[![npm downloads](https://img.shields.io/npm/dm/@js-nerds/browser-csv-txt-downloader)](https://www.npmjs.com/package/@js-nerds/browser-csv-txt-downloader)
[![tests](https://github.com/js-nerds/browser-csv-txt-downloader/actions/workflows/build-test.yml/badge.svg?branch=main&label=tests)](https://github.com/js-nerds/browser-csv-txt-downloader/actions/workflows/build-test.yml)
[![coverage](https://codecov.io/gh/js-nerds/browser-csv-txt-downloader/branch/main/graph/badge.svg)](https://codecov.io/gh/js-nerds/browser-csv-txt-downloader)

Client-side TypeScript utility to download CSV and TXT files in the browser.

## Install

```bash
npm install @js-nerds/browser-csv-txt-downloader
```

```bash
pnpm add @js-nerds/browser-csv-txt-downloader
```

```bash
yarn add @js-nerds/browser-csv-txt-downloader
```

## Usage

```ts
import { downloadCsvFile, downloadTextFile } from "@js-nerds/browser-csv-txt-downloader";

downloadCsvFile(
  [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 }
  ],
  {
    fileName: "users.csv",
    columns: [
      { key: "name", header: "Name" },
      { key: "age", header: "Age" }
    ]
  }
);

downloadTextFile({
  fileName: "note.txt",
  content: "Hello from browser"
});
```

## API

### `downloadFile(options)`

Downloads file by selected format (`csv` or `txt`).
This package is browser-only. In non-browser environments (SSR/Node.js), the function returns `false`.

**BOM defaults (`includeBom`)**
- CSV: default is `true` (BOM is included unless `includeBom: false` is passed).
- TXT: default is `false` (BOM is included only when `includeBom: true` is passed).
- You can always override the default per call via `includeBom`.

Examples:

```ts
downloadCsvFile(rows, {
  fileName: "users.csv",
  columns,
  includeBom: false
});

downloadTextFile({
  fileName: "note.txt",
  content: "Hello",
  includeBom: true
});
```

**Returns**
- `boolean` — `true` if download started, `false` when browser APIs are unavailable.

### `downloadCsvFile(rows, options)`

Compatibility wrapper for CSV export.

### `downloadTextFile(options)`

Convenience wrapper for TXT export.

## License

MIT

## Changelog

See `CHANGELOG.md`.
