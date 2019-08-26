export interface DeepArray<T> extends Array<T | DeepArray<T>> {}

export interface Substitutions {
  [key: string]: string;
}

export type InjectPath = number | string | DeepArray<number | string>;
