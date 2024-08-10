const keywords = [
  {
    radius: 5000,
    results: query.execute(`nwr[name=~Costco](prefix=colorado)`),
  },
  {
    radius: 1000,
    results: query.execute(
      `nwr[amenity=cafe][name][name!~Starbucks](prefix=colorado)`,
    ),
  },
  {
    radius: 5000,
    results: query.execute(`nwr[amenity=school][name](prefix=colorado)`),
  },
];

keywords.sort((a, b) => a.results.length - b.results.length);

const neighbors = new Map<number, Map<number, Result>>();
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
    values.forEach((value) =>
      neighbors.get(values[0].id)?.set(value.id, value)
    );
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
        entry.bound().extend(keywords[index].radius)
      ),
    );

    return features.concat(
      [
        bounds.asFeature({
          "fill": colors.pick(index),
          "fill-opacity": 0.5,
        }),
      ],
    );
  }).filter(Boolean),
};

assert.geoJSON(payload);

export { payload };
