---
outline: deep
---

# Runtime API

The API endpoint is `/proxy/api/runtime`. This endpoint allows arbitrary
Javascript scripts to run within the runtime of the Go code that queries the OSM
data I've processed.

NOTE: The API endpoint goes through Cloudflare Proxy at the moment. This was
designed to have some load balancing and security protection in front of my
native API endpoint.

## Functions

### `query.execute(query)`

Performs a geographical query.

**Parameters:**

- `query`: A string representing the query.

**Returns:**

- An array of results matching the query.

**Example:**

```javascript
const results = query.execute("nwr[name=~Costco](prefix=colorado)");
```

### `query.prefixes()`

Retrieves available geographical prefixes.

**Returns:**

- An array of prefix objects.

**Example:**

```javascript
const prefixes = query.prefixes();
```

### `geo.asResults(...queries)`

Combines multiple queries into a single result set.

**Parameters:**

- `queries`: Multiple query results.

**Returns:**

- A combined result set.

**Example:**

```javascript
const allUnis = geo.asResults(
  ...prefixes.flatMap((prefix) => {
    return query.execute(`wr[amenity=university][name](prefix=${prefix.name})`);
  }),
);
```

### `colors.pick(index)`

Generates a color based on an index. This returns color-blind friendly colors.

**Parameters:**

- `index`: A numerical index.

**Returns:**

- A color in hexadecimal format.

**Example:**

```javascript
const color = colors.pick(1);
```

### `geo.asBounds(...entries)`

Creates a bounding box from multiple entries.

**Parameters:**

- `entries`: Multiple entries to be included in the bounding box.

**Returns:**

- A bounding box object.

**Example:**

```javascript
const bounds = geo.asBounds(entry1, entry2, entry3);
```

### `assert.eq(value1, value2, message)`

Asserts that two values are equal.

**Parameters:**

- `value1`: The first value.
- `value2`: The second value.
- `message`: A string message indicating the assertion.

**Example:**

```javascript
assert.eq(5, 5, "expected 5 to equal 5");
```

### `assert.geoJSON(payload)`

Asserts that a payload is valid GeoJSON.

**Parameters:**

- `payload`: The GeoJSON payload.

**Example:**

```javascript
const payload = {
  type: "FeatureCollection",
  features: [],
};

assert.geoJSON(payload); // Asserts the payload is valid GeoJSON
```

## Examples

### List of counties

The following script will return all the counties, their state, and center point
of a the bounding box.

```javascript
const prefixes = geo.prefixes();

const counties = prefixes.flatMap((prefix) => {
  const results = geo.query(
    `nwr[admin_level=6][boundary=administrative][name](prefix=${prefix.name})`,
  );
  return results.map((county) => {
    const center = county.bbox().center();

    return {
      name: county.name,
      lat: center.lat(),
      lon: center.lon(),
      state: prefix.name,
    };
  });
});

return counties;
```

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
