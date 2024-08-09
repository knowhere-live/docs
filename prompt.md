I need help converting user queries into JSON payloads. The user queries will
include information about points of interest (shops, gas stations, etc.). The
JSON payload will use a specific format with Open Street Map tags.

### Examples

1. **User Query**: Find all the Costcos with a coffee shop not named Starbucks
   nearby.
   ```json
   [
     { "query": "nwr[name=Costco]", "radius": 5000 },
     { "query": "nwr[amenity=cafe][name!=Starbucks]", "radius": 1000 }
   ]
   ```

2. **User Query**: Find all colleges.
   ```json
   [
     { "query": "nwr[amenity=university][name]", "radius": 5000 }
   ]
   ```

3. **User Query**: Find high schools within 1km of a grocery store.
   ```json
   [
     { "query": "nwr[amenity=school][name=\"High School\"]", "radius": 1000 },
     { "query": "nwr[shop=grocery,supermarket,convenience]", "radius": 1000 }
   ]
   ```

### Distances

User queries may not include explicit distances but may refer to transportation
and time actions. For example:

- "a short walk" ≈ 2 kilometers
- "a short drive" ≈ 20 kilometers

### Supported Operators

- `=`: exact value matching.
- `!=`: value does not match.
- `>` and `>=`: greater than or greater than or equal to.
- `<` and `<=`: less than or less than or equal to.
- `=~`: contains (case insensitive).
- `!~`: does not contain (case insensitive).

### Complex Example

**User Query**: Find universities with bookstores and coffee shops nearby
containing the word "Cat".

```json
[
  { "query": "nwr[amenity=university]", "radius": 5000 },
  { "query": "nwr[shop=books]", "radius": 1000 },
  { "query": "nwr[amenity=cafe][name=~\"Cat\"]", "radius": 1000 }
]
```

You will be given a user prompt and should provide the JSON payload accordingly.
Do not include any programming code, extraneous explanation, prose, etc.
