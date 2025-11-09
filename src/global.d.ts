declare const assert: Assert;
declare const colors: Colors;
declare const geo: Geo;
declare const params: Params;
declare const query: Query;

interface IsochroneConfig {
  profile?: string;
  contours_minutes?: number[];
  contours_meters?: number[];
  denoise?: number;
  generalize?: number;
}

interface Properties {
  [key: string]: string | number | boolean | IsochroneConfig;
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
  pick(index: number): string;
}

interface Bound {
  extend(distance: number): Bound;
  center(): Point;
  intersects(bound: Bound): boolean;
  min(): [number, number];
  max(): [number, number];
  asFeature(properties?: Properties, appendTags?: boolean): Feature;
  asBB(): string;
}

interface BoundArray extends Array<Bound> {
  asFeature(properties?: Properties, appendTags?: boolean): Feature;
  asBound(): Bound;
}

interface Point {
  asFeature(properties?: Properties, appendTags?: boolean): Feature;
  asBound(): Bound;
  lat(): number;
  lon(): number;
}

interface Prefix {
  name: string;
  fullName: string;
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
  distance(p1: Bound, p2: Bound): number;
  rtree(): Tree;
}

interface Result {
  asFeature(properties?: Properties, appendTags?: boolean): Feature;
  name: string;
  id: number;
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  tags: { [key: string]: string };
  asBound(): Bound;
  asPoint(): Point;
}

interface Tree {
  nearby(bound: Bound, distance: number): ResultArray;
  within(bound: Bound): ResultArray;
  insert(result: Result): void;
}

interface ResultArray extends Array<Result> {
  asTree(depth: number): Tree;
  cluster(distance: number): ResultArray;
  overlap(
    results: ResultArray,
    originRadius: number,
    neighborRadius: number,
    count: number,
  ): ResultArray[];
  tagCount(): { [key: string]: number };
}

interface Query {
  union(...queries: string[]): ResultArray;
  execute(queryString: string): ResultArray;
  areas(): Prefix[];
  fromAddress(address: string): ResultArray;
}

// Params is intentionally loosely typed to allow flexible access patterns in scripts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Params {
  [key: string]: any;
}
