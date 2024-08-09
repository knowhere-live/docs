# Query Language

The query language allows users to find points of interest from pre-processed
Open Street Map data. It is similar in style to Overpass Query Language but has
different syntax.

## Syntax

A node (`n`), way (`w`), or relation (`r`) feature filter starts the query.

```
n   // all nodes
w   // all ways
r   // all relations
nw  // all nodes and ways
nwr // all nodes, ways, and relations
* // all nodes, ways, and relations
```

Then, the type can be filtered by the tags associated with the feature. Most
tags in Open Street Map are mainly string key-value pairs.

The supported operators for tag matching are:

- `=` (equals): checks for exact value matching.
- `!=` (not equals): checks that the value does not match.
- `>` and `>=` (greater than and greater than or equal to): checks that a value
  is greater than or greater than or equal to the specified value.
- `<` and `<=` (less than and less than or equal to): checks that a value is
  less than or less than or equal to the specified value.
- `=~` (contains): checks if the value contains the string, case insensitive.
- `!~` (does not contain): checks if the value does not contain the string, case
  insensitive.

### Examples

```
nw[amenity=cafe]                  // nodes and ways where amenity equals cafe
nw[amenity=cafe][name!=Starbucks] // nodes and ways where amenity equals cafe and name is not Starbucks
w[population>800]                 // ways where population is greater than 800
n[population>=800]                // nodes where population is greater than or equal to 800
nw[name=~Starbucks]               // nodes and ways with names that contain Starbucks
nw[name!~Starbucks]               // nodes and ways with names that do not contain Starbucks
```

This language provides a flexible and powerful way to query Open Street Map
data, enabling users to find specific points of interest based on various
criteria.
