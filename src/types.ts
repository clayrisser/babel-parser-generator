export interface DeepArray<T> extends Array<T | DeepArray<T>> {}

export type InjectPath = number | string | DeepArray<number | string>;
