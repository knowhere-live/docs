# Changelog

## 08-10-2024

- Added Typescript support to the runtime. This includes the
  [type definition](global.d.ts), which can be used in your file via:

  ```typescript
  /// <reference path="global.d.ts" />
  ```

  _Note_: This is not being distributed with the package, so you will need to
  add it to your project manually.
