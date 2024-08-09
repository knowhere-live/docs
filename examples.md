# Examples

The following examples help show patterns for generating GeoJSON to display on
the map. They require use from the [runtime](runtime.md) environment.

## Find universities nearby each other

Let's find unique university campuses near each other.

```javascript
const prefixes = query.prefixes();

// find all the universities country wide
const allUnis = geo.asResults(
  ...prefixes.flatMap((prefix) => {
    return query.execute(
      `wr[amenity=university][name](prefix=${prefix.name})`,
    );
  }),
);

const radius = 500; // meters
const overlap = 3000; // meters

// find multiple marked universities near each other
// helpful when there are lots of buildings on the campus
// `cluster` always returns the largest area
const clustered = allUnis.cluster(radius);

// find clustered items that overlap each other
// this should find campuses that are near each other
const grouped = clustered.overlap(clustered, overlap, 0, 3);

// lets generate the GeoJSON
const payload = {
  type: "FeatureCollection",
  features: grouped.flatMap((entries, index) => {
    const features = entries.flatMap((entry) => {
      const feature = entry.asFeature({
        "marker-color": colors.pick(index),
        index: index,
      });

      return feature;
    });

    const bounds = geo.asBounds(
      ...entries.map((entry) => entry.bbox().extend(overlap)),
    );

    return features.concat(
      [
        bounds.asFeature({
          "fill": colors.pick(index),
          "fill-opacity": 0.2,
        }),
      ],
    );
  }),
};

return payload;
```

## Find neighborhood areas near areas

This finds neighborhoods within Colorado that are within driving distance of
Costco and walking distance from a highschool and coffee shop.

```javascript
const keywords = [
  { query: "nwr[name=~Costco]", radius: 5000 },
  { query: "nwr[amenity=cafe][name][name!~Starbucks]", radius: 1000 },
  { query: "nwr[amenity=school][name]", radius: 5000 },
];

keywords.forEach((keyword) => {
  keyword.results = query.execute(`${keyword.query}(prefix=colorado)`);
});

keywords.sort((a, b) => a.results.length - b.results.length);

const neighbors = new Map();
const cluster = keywords[0].results.cluster(500);
cluster.forEach((entry) => {
  neighbors.set(entry.id, new Map());
});

const expectedNeighbors = 2;

keywords.slice(1).forEach((keyword) => {
  const grouped = cluster.overlap(
    keyword.results,
    keywords[0].radius,
    keyword.radius,
    expectedNeighbors - 1,
  );
  grouped.forEach((values) => {
    values.forEach((value) => neighbors.get(values[0].id).set(value.id, value));
  });
});

const payload = {
  type: "FeatureCollection",
  features: [...neighbors.values()].flatMap((set, index) => {
    const entries = [...set.values()];

    if (entries.length !== keywords.length) {
      return;
    }

    const features = entries.flatMap((entry, index) => {
      const color = colors.pick(index);

      const feature = entry.asFeature({
        "marker-color": color,
        index: index,
      });

      return feature;
    });

    const bounds = geo.asBounds(
      ...entries.map((entry, index) =>
        entry.bbox().extend(keywords[index].radius)
      ),
    );

    return features.concat(
      [
        bounds.asFeature({
          "fill": colors.pick(index),
          "fill-opacity": 0.5,
          "url": zillowURL(bounds.asBound()),
        }),
      ],
    );
  }).filter(Boolean),
};

assert.geoJSON(payload);

return payload;
```
