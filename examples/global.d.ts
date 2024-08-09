declare const assert: Assert;
declare const colors: Colors;
declare const geo: Geo;
declare const params: Params;
declare const query: Query;

interface Properties {
  [key: string]: string | number | boolean;
}

interface Feature {
  type: string;
  properties: Properties;
  geometry: any;
}

interface Assert {
  geoJSON(payload: any): void;
  eq(value1: any, value2: any, message: string): void;
}

interface Colors {
  pick(number): string;
}

interface Bound {
  extend(number);
  center(): Point;
}

interface BoundArray extends Array<Bound> {
  asFeature(properties: Properties): Feature;
}

interface Point {
  asFeature(properties: Properties): Feature;
  asBound(): Bound;
  lat(): number;
  lon(): number;
}

interface Prefix {
  name: string;
  fullName: string;
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

interface Geo {
  asPoint(lat: number, lon: number): Point;
  asResults(...results: Result[]): ResultArray;
  asBounds(...bounds: Bound[]): BoundArray;
}

interface Result {
  asFeature(hash): Feature;
  name: string;
  id: number;
  bound(): Bound;
}

interface Tree {
  nearby(Bound, number): ResultArray;
  within(Bound): ResultArray;
}

interface ResultArray extends Array<Result> {
  asTree(depth: number): Tree;
  cluster(number): ResultArray;
  overlap(
    results: ResultArray,
    originRadius: number,
    neighborRadius: number,
    count: number,
  ): ResultArray[];
}

interface Query {
  union(...string): ResultArray;
  execute(string): ResultArray;
  prefixes(): Prefix[];
}

interface Params {
  [key: string]: string;
}
