# MCP Server

Knowhere provides a Model Context Protocol (MCP) server that exposes its
geospatial query capabilities as tools, resources, and prompts for AI assistants
and other MCP clients.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open
standard that enables AI assistants to securely access data and tools from
various sources. Knowhere's MCP server allows AI models to:

- Query OpenStreetMap data using natural language
- Execute complex geospatial analysis with JavaScript/TypeScript
- Access comprehensive documentation as resources
- Generate queries and analysis code using prompts

## Getting Started

The MCP server is integrated into the Knowhere HTTP server. Start the server:

```bash
knowhere server --port 8080 --db entries.db
```

The MCP endpoint is available at `http://localhost:8080/api/mcp` using the HTTP
streamable transport.

### Connecting with Claude Desktop

Add Knowhere to your Claude Desktop configuration to connect via HTTP:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "knowhere": {
      "url": "http://localhost:8080/api/mcp"
    }
  }
}
```

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "knowhere": {
      "url": "http://localhost:8080/api/mcp"
    }
  }
}
```

After updating the configuration, restart Claude Desktop.

## Available Tools

### search

Search OpenStreetMap POI data using Knowhere query language.

**Input:**

```json
{
  "query": "nw[amenity=restaurant](area=california)",
  "limit": 100
}
```

**Supports both syntaxes:**

Original:

```
nw[amenity=restaurant](area=california)
n[name=~Starbucks][amenity=cafe](area=new_york)
```

MongoDB-style:

```json
{"amenity": "restaurant", "$area": "california"}
{"name": {"$regex": "Starbucks"}, "amenity": "cafe", "$area": "new_york"}
```

**Output:** GeoJSON FeatureCollection

### runtime

Execute JavaScript/TypeScript code with query capabilities.

**Input:**

```json
{
  "code": "const results = await query.execute('nw[amenity=restaurant](area=california)'); export const payload = { count: results.features.length };"
}
```

**Output:** Execution result with payload

**Available APIs:**

- `query.execute(queryString)` - Execute queries
- `geo.distance(lon1, lat1, lon2, lat2)` - Calculate distances
- `geo.bounds(features)` - Calculate bounding boxes
- `geo.center(features)` - Calculate centroids
- `result.geoJSON(data)` - Format as GeoJSON
- `assert.geoJSON(data)` - Validate GeoJSON

### list_areas

List all available geographic areas for querying.

**Input:** None

**Output:**

```json
{
  "areas": ["california", "new_york", "texas", ...]
}
```

## Available Resources

Resources provide documentation that can be read by MCP clients.

### knowhere://docs/query

Complete documentation for the Knowhere query language including:

- Element types (nodes, ways, relations)
- Tag filtering operators
- Directives (area, bounding box, ID filters)
- Query examples

### knowhere://docs/mongodb

Documentation for MongoDB-style JSON query syntax:

- Equality and comparison operators
- Array operators ($in, $nin)
- Existence operators ($exists)
- Pattern matching ($regex)
- Numeric comparisons ($gt, $gte, $lt, $lte)

### knowhere://docs/runtime

JavaScript/TypeScript runtime API reference:

- Query execution methods
- Geospatial utility functions
- Result formatting
- Testing utilities
- Complete examples

## Available Prompts

Prompts help generate queries and code for common use cases.

### query_examples

Generate example queries for common use cases.

**Arguments:**

- `use_case` (required): Type of query (e.g., "restaurants", "universities",
  "parks")
- `area` (optional): Geographic area (defaults to "california")

**Example usage in Claude:**

> "Use the query_examples prompt to show me restaurant queries for San
> Francisco"

### analyze_area

Generate code to analyze POIs in a specific geographic area.

**Arguments:**

- `area` (required): Geographic area to analyze
- `analysis_type` (required): Type of analysis ("density", "distribution",
  "clustering")

**Example usage in Claude:**

> "Use the analyze_area prompt to create a density analysis for New York"

## Usage Examples

### Basic Query with Claude

```
User: Search for coffee shops in Seattle

Claude: I'll use the search tool to find coffee shops.

Tool: search
Query: nw[amenity=cafe](area=seattle)
Limit: 50

Results: Found 45 coffee shops with names, addresses, and coordinates
```

### Complex Analysis

```
User: Analyze restaurant distribution in San Francisco by cuisine type

Claude: I'll use the runtime tool to analyze restaurant data.

Tool: runtime
Code: |
  const restaurants = await query.execute('nw[amenity=restaurant](area=san_francisco)');
  const cuisines = {};
  
  for (const feature of restaurants.features) {
    const cuisine = feature.properties.cuisine || 'unknown';
    cuisines[cuisine] = (cuisines[cuisine] || 0) + 1;
  }
  
  const sorted = Object.entries(cuisines)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  export const payload = {
    totalRestaurants: restaurants.features.length,
    topCuisines: sorted
  };

Results: Analysis showing top 10 cuisines and restaurant counts
```

### Using Resources

```
User: How do I query for specific tags?

Claude: Let me check the query documentation.

Resource: knowhere://docs/query

[Shows complete query language documentation]
```

## Advanced Usage

### Custom MCP Client

You can integrate Knowhere's MCP server into your own applications:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "knowhere",
  args: ["mcp", "--db", "entries.db"],
});

const client = new Client({
  name: "my-app",
  version: "1.0.0",
}, {});

await client.connect(transport);

// List available tools
const tools = await client.listTools();

// Call search tool
const result = await client.callTool({
  name: "search",
  arguments: {
    query: "nw[amenity=restaurant](area=california)",
    limit: 10,
  },
});
```

### Python Client

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(
    command="knowhere",
    args=["mcp", "--db", "entries.db"]
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize
        await session.initialize()
        
        # List tools
        tools = await session.list_tools()
        
        # Call search
        result = await session.call_tool(
            "search",
            arguments={
                "query": "nw[amenity=restaurant](area=california)",
                "limit": 10
            }
        )
```

## Configuration Options

### Database Path

The `--db` flag specifies the SQLite database containing OSM data:

```bash
knowhere mcp --db /path/to/entries.db
```

### Log Level

Control logging verbosity:

```bash
knowhere mcp --db entries.db --log-level debug
```

Levels: debug, info, warn, error (default: info)

## Troubleshooting

### Connection Issues

**Problem:** Claude Desktop shows "Server not responding"

**Solution:**

1. Check the database path is correct and absolute
2. Verify knowhere binary is executable: `chmod +x knowhere`
3. Test manually: `knowhere mcp --db entries.db`
4. Check logs in Claude Desktop developer console

### Query Errors

**Problem:** Queries return "invalid query" error

**Solution:**

1. Use the `knowhere://docs/query` resource to check syntax
2. Verify area name with `list_areas` tool
3. Test query with: `knowhere generate --value "your query"`

### Empty Results

**Problem:** Search returns no results

**Solution:**

1. Verify the area exists: use `list_areas` tool
2. Check if data exists for that tag combination
3. Try a broader query first: `nwr[*=*](area=california)` (limit results!)

## Performance Tips

1. **Limit Results**: Always specify a reasonable limit for large queries
2. **Use Specific Areas**: Querying specific areas is much faster than broad
   searches
3. **Bounding Boxes**: Use `(bb=...)` for small geographic regions
4. **Cache Results**: Store query results in variables when running multiple
   analyses

## Security Considerations

The MCP server:

- Runs with the same permissions as the knowhere binary
- Only accesses the specified database file
- Does not make network requests
- Executes JavaScript in a sandboxed runtime

**Best Practices:**

- Use read-only database files when possible
- Run with minimal required permissions
- Validate query results in your application
- Monitor resource usage for large queries

## Next Steps

- Read the [Query Language](query.md) documentation
- Explore [Runtime API](runtime.md) capabilities
- Check out [MongoDB Query Language](mongodb-query-language.md)
- See practical examples in the repository

## Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP Go SDK](https://github.com/modelcontextprotocol/go-sdk)
- [Claude Desktop](https://claude.ai/desktop)
