# Runtime API

The API endpoint is `/proxy/api/runtime`. This endpoint allows arbitrary
Javascript scripts to run within the runtime of the Go code that queries the
Open Street Map data.

The runtime is a sandboxed custom environment, with the following restrictions:

- No network access
- No file access
- No npm packages -- no `import` or `require`
- Timeout 10 seconds

It supports the following:

- Typescript, but no type verification is done.
- Standard [ECMAScript 5.1 features](https://262.ecma-international.org/5.1/) --
  i.e.
  [Regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions),
  [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date),
  [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON),
  etc.

## Functions

This is the [list of functions](global.d.ts) that are available to use in the
javascript runtime.

<!-- deno-fmt-ignore-start -->
```typescript
--8<-- "src/global.d.ts"
```
<!-- deno-fmt-ignore-end -->

## Examples

### List of counties (via `curl`)

The following script will return all the counties, their state, and center point
of a the bounding box.

<!-- deno-fmt-ignore-start -->
```javascript
--8<-- "src/examples/countries.ts"
```
<!-- deno-fmt-ignore-end -->

This script can be applied via two methods a `source` parameter in the query
string or the request body. If using the query string, Cloudflare will cache it
for 25 minutes (1500 seconds).

The above script can be used in a `curl` command doing the following:

```bash
# create `script.js` of the above javascript
curl -X GET --data-urlencode "source@script.js" 'https://knowhere.live/proxy/api/runtime'
```

This will return a JSON payload in the format of:

```json
[
  {
    "lat": 34.80427,
    "lon": -85.484545,
    "name": "Dade County",
    "state": "alabama"
  }
]
```

This entire payload could be used for an auto complete client side. Rather that
off loading all auto complete filtering to server side.

### Find universities nearby each other

Let's find unique university campuses near each other.

<!-- deno-fmt-ignore-start -->
```javascript
--8<-- "src/examples/universities.ts"
```
<!-- deno-fmt-ignore-end -->

### Find neighborhood areas near areas

This finds neighborhoods within Colorado that are within driving distance of
Costco and walking distance from a highschool and coffee shop.

<!-- deno-fmt-ignore-start -->
```javascript
--8<-- "src/examples/neighborhoods.ts"
```
<!-- deno-fmt-ignore-end -->
