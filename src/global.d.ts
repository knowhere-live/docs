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
  geometry: unknown;
}

interface Assert {
  geoJSON(payload: unknown): void;
  eq(value: boolean, message: string): void;
  stab(msg: string): void;
}

interface Colors {
  pick(number): string;
}

interface Bound {
  extend(number): Bound;
  center(): Point;
  intersects(bound: Bound): boolean;
  min(): [number, number];
  max(): [number, number];
  asFeature(properties?: Properties): Feature;
  asBB(): string;
}

interface BoundArray extends Array<Bound> {
  asFeature(properties?: Properties): Feature;
  asBound(): Bound;
}

interface Point {
  asFeature(properties?: Properties): Feature;
  asBound(): Bound;
  lat(): number;
  lon(): number;
}

interface Area {
  name: string;
  fullName: string;
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  asBound(): Bound;
}

interface Geo {
  asPoint(lat: number, lon: number): Point;
  asResults(...results: Result[]): ResultArray;
  asBounds(...bounds: Bound[]): BoundArray;
  distance(p1: Bound, p2: Bound): Number
  rtree(): Tree;
}

interface Result {
  asFeature(properties?: Properties): Feature;
  name: string;
  id: number;
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  tags: { [key: string]: string };
  asBound(): Bound;
}

interface Tree {
  nearby(Bound, number): ResultArray;
  within(Bound): ResultArray;
  insert(Result): void;
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
  tagCount(): { [key: string]: number };
}

interface Query {
  union(...string): ResultArray;
  execute(string): ResultArray;
  areas(): Prefix[];
  fromAddress(address: string): ResultArray;
}

interface Params {
  [key: string]: string;
}
