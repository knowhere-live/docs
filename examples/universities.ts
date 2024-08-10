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
      ...entries.map((entry) => entry.bound().extend(overlap)),
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

export { payload };
