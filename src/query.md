# Query Language

The query language allows users to find points of interest from pre-processed OpenStreetMap data. It is similar in style to the Overpass Query Language but has different syntax.

## Syntax

There are three elements to the query language:

- The type of element, which corresponds to OpenStreetMap [elements](https://wiki.openstreetmap.org/wiki/Elements).

    A node (`n`), way (`w`), or relation (`r`) feature filter starts the query.

    ```
    n   // all nodes
    w   // all ways
    r   // all relations
    nw  // all nodes and ways
    nwr // all nodes, ways, and relations
    *   // all nodes, ways, and relations
    ```

- The tags that are attached to the element(s), which are wrapped in `[]` (square brackets).

    The type can then be filtered by the tags associated with the feature. Most tags in OpenStreetMap are string key-value pairs.

    The supported operators for tag matching are:

    - `=` (equals): checks for exact value matching.
    - `!=` (not equals): checks that the value does not match.
    - `>` and `>=` (greater than and greater than or equal to): checks that a value is greater than or greater than or equal to the specified value.
    - `<` and `<=` (less than and less than or equal to): checks that a value is less than or less than or equal to the specified value.
    - `=~` (contains): checks if the value contains the string, case-insensitive.
    - `!~` (does not contain): checks if the value does not contain the string, case-insensitive.

    !!! info
        Values for a tag can be enclosed in `"` (double quotes) to support longer names with spaces.

    *Examples:*

    - `nw[amenity=cafe]` - nodes and ways where the amenity equals cafe
    - `nw[amenity=cafe][name!=Starbucks]` - nodes and ways where the amenity equals cafe and the name is not Starbucks
    - `w[population>800]` - ways where the population is greater than 800
    - `n[population>=800]` - nodes where the population is greater than or equal to 800
    - `nw[name=~Starbucks]` - nodes and ways with names that contain Starbucks
    - `nw[name!~Starbucks]` - nodes and ways with names that do not contain Starbucks
    - `n[name="Starbucks","Coffee"]` - nodes with names that exactly match "Starbucks" or "Coffee"

- A directive limiting the results based on non-OpenStreetMap data. These are always wrapped in `()` (parentheses).
    - `area=<string>` - This is *required* for each query. It limits the range of elements to a specific area.
    - `bb=minLon,minLat,maxLon,maxLat` - This returns results only within a bounding box. It is used with `area`, not as a replacement for it.
    - `id=<number>,<number>,...` - Returns specific OpenStreetMap identifiers.

This language provides a flexible and powerful way to query OpenStreetMap data, enabling users to find specific points of interest based on various criteria.
