# MongoDB Query Language Support

Knowhere now supports MongoDB-style JSON query syntax as an alternative to the
original query language. Both syntaxes produce identical SQL queries and return
the same results.

## Why MongoDB Syntax?

The MongoDB query language is:

- **More familiar** - Used by millions of developers
- **Self-documenting** - JSON structure is clearer than custom DSL
- **Tool-friendly** - Easy to generate, validate, and manipulate
  programmatically
- **Type-safe** - Easier to validate and provide IDE autocomplete

## Quick Comparison

### Original Syntax

```
n[amenity=restaurant][cuisine=sushi](area=california)
```

### MongoDB Syntax

```json
{
  "$type": "node",
  "$area": "california",
  "amenity": "restaurant",
  "cuisine": "sushi"
}
```

## Usage

### In Runtime (JavaScript/TypeScript)

```typescript
// Original syntax
const results1 = query.execute("n[amenity=restaurant](area=california)");

// MongoDB syntax
const results2 = query.execute(JSON.stringify({
  "$type": "node",
  "$area": "california",
  "amenity": "restaurant",
}));

// Both return identical results
```

### In HTTP API

```bash
# Original syntax
curl "http://localhost:8080/api/search?search=n[amenity=restaurant]"

# MongoDB syntax (URL-encoded)
curl "http://localhost:8080/api/search?search=%7B%22amenity%22%3A%22restaurant%22%7D"

# Or with POST
curl -X POST "http://localhost:8080/api/search" \
  -d 'search={"amenity":"restaurant"}'
```

## Operators Reference

### Directives (Special Query Parameters)

| Operator | Description         | Example                                             |
| -------- | ------------------- | --------------------------------------------------- |
| `$type`  | Element type filter | `{"$type": "node"}` or `{"$type": ["node", "way"]}` |
| `$area`  | Geographic area     | `{"$area": "california"}`                           |
| `$bb`    | Bounding box        | `{"$bb": [-122.5, 37.7, -122.4, 37.8]}`             |
| `$id`    | Specific OSM IDs    | `{"$id": [123, 456]}`                               |

#### Type Values

- `"node"` or `"n"` - Points/nodes only
- `"way"` or `"w"` - Ways only
- `"relation"` or `"r"` - Relations only
- `"geojson"` or `"g"` - GeoJSON features
- `"*"` - All types (default)
- `["node", "way"]` - Multiple types

### Field Operators

| Operator         | Description                 | Example                                       | Original Equivalent    |
| ---------------- | --------------------------- | --------------------------------------------- | ---------------------- |
| Shorthand        | Exact match                 | `{"amenity": "restaurant"}`                   | `[amenity=restaurant]` |
| `$eq`            | Exact match                 | `{"amenity": {"$eq": "restaurant"}}`          | `[amenity=restaurant]` |
| `$ne`            | Not equals                  | `{"amenity": {"$ne": "fast_food"}}`           | `[amenity!=fast_food]` |
| `$in`            | Match any (OR)              | `{"amenity": {"$in": ["cafe", "pub"]}}`       | `[amenity=cafe,pub]`   |
| `$nin`           | Not in array                | `{"amenity": {"$nin": ["cafe", "pub"]}}`      | `[amenity!=cafe,pub]`  |
| `$exists`        | Field exists                | `{"name": {"$exists": true}}`                 | `[name]`               |
| `$exists: false` | Field doesn't exist         | `{"name": {"$exists": false}}`                | `[!name]`              |
| `$regex`         | Contains (case-insensitive) | `{"name": {"$regex": "Starbucks"}}`           | `[name=~Starbucks]`    |
| `$not`           | Negates inner operator      | `{"name": {"$not": {"$regex": "Starbucks"}}}` | `[name!~Starbucks]`    |

### Numeric Operators

| Operator | Description           | Example                          | Original Equivalent  |
| -------- | --------------------- | -------------------------------- | -------------------- |
| `$gt`    | Greater than          | `{"population": {"$gt": 1000}}`  | `[population>1000]`  |
| `$gte`   | Greater than or equal | `{"population": {"$gte": 1000}}` | `[population>=1000]` |
| `$lt`    | Less than             | `{"admin_level": {"$lt": 8}}`    | `[admin_level<8]`    |
| `$lte`   | Less than or equal    | `{"admin_level": {"$lte": 6}}`   | `[admin_level<=6]`   |

## Examples

### Basic Queries

```json
// All restaurants
{"amenity": "restaurant"}

// Nodes only
{"$type": "node", "amenity": "restaurant"}

// In specific area
{"$area": "california", "amenity": "restaurant"}
```

### Multiple Conditions (AND)

```json
{
  "amenity": "restaurant",
  "cuisine": "sushi",
  "name": { "$exists": true }
}
```

### OR Conditions (using $in)

```json
{
  "amenity": { "$in": ["restaurant", "cafe", "pub"] }
}
```

### Exclusion

```json
{
  "amenity": "cafe",
  "name": { "$not": { "$regex": "Starbucks" } }
}
```

### Numeric Filtering

```json
{
  "place": "city",
  "population": { "$gte": 100000 },
  "admin_level": { "$lte": 6 }
}
```

### Bounding Box Search

```json
{
  "$bb": [-122.5, 37.7, -122.4, 37.8],
  "amenity": "restaurant",
  "cuisine": "italian"
}
```

### Complex Query

```json
{
  "$type": ["node", "way"],
  "$area": "california",
  "$bb": [-122.5, 37.7, -122.4, 37.8],
  "amenity": "restaurant",
  "cuisine": { "$in": ["sushi", "japanese", "asian"] },
  "name": { "$exists": true },
  "takeaway": { "$ne": "only" }
}
```

## Implementation Details

### Query Detection

The system automatically detects which syntax you're using:

- If the query starts with `{`, it's treated as MongoDB JSON
- Otherwise, it's treated as the original query language

### SQL Generation

Both syntaxes produce identical SQL queries by:

1. Parsing the query into an Abstract Syntax Tree (AST)
2. Converting the AST to optimized SQL with FTS5 and R-Tree indexes

### Performance

MongoDB syntax has **identical performance** to the original syntax because:

- Both use the same underlying SQL generation
- Both use the same indexes (FTS5 full-text search, R-Tree spatial)
- The only difference is parsing time (negligible)

## TypeScript Example

See [`examples/mongo-syntax.ts`](../examples/mongo-syntax.ts) for a complete
working example using MongoDB query syntax in the Knowhere runtime.

## Testing

The MongoDB query parser has comprehensive test coverage in
`query/mongo_test.go` with over 30 test cases covering:

- All operators and directives
- Error handling
- SQL generation equivalence
- Edge cases

Run tests with:

```bash
cd query && go test -v -ginkgo.focus="MongoDB"
```
