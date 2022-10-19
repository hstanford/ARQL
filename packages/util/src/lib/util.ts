export type Dictionary<T = any> = { [key: string]: T };

export type PickByNotValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
>;

export function uniq<T>(arr: T[]) {
  return arr.filter(
    (field, idx, self) => idx === self.findIndex((f2) => f2 === field)
  );
}

export function uniqBy<T>(arr: T[], key: keyof T) {
  return arr.filter(
    (field, idx, self) => idx === self.findIndex((f2) => f2[key] === field[key])
  );
}
