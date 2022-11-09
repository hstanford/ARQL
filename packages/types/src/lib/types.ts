export abstract class TypeNode<T> {
  constructor(opts: T) {
    Object.assign(this, opts);
  }
  /** Is this node a superset of the type passed as the argument? */
  abstract satisfiedBy(type: Type): boolean;

  /** return the Type, or the resolved type if generic */
  abstract resolve(): Type;

  /** serialiser */
  abstract toString(): string;
}

export type DataType = 'string' | 'number' | 'boolean' | 'json' | 'date';

export interface IPrimitiveType<T extends DataType> {
  name: T;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PrimitiveType<T extends DataType> extends IPrimitiveType<T> {}
export class PrimitiveType<T extends DataType> extends TypeNode<
  IPrimitiveType<T>
> {
  _type = 'primitive' as const;
  satisfiedBy(type: Type): boolean {
    return (
      (type instanceof PrimitiveType && type.name === this.name) ||
      (type instanceof LiteralType && typeof type.value === this.name) ||
      type instanceof AnyType
      // TODO: fix for literal Dates etc
    );
  }
  resolve() {
    return this;
  }
  toString(): string {
    return this.name;
  }
}

export class NeverType extends TypeNode<Record<string, never>> {
  _type = 'never' as const;
  satisfiedBy(): boolean {
    return false;
  }
  resolve() {
    return this;
  }
  toString(): string {
    return 'never';
  }
}

export class UnknownType extends TypeNode<Record<string, never>> {
  _type = 'unknown' as const;
  satisfiedBy(): boolean {
    return true;
  }
  resolve() {
    return this;
  }
  toString(): string {
    return 'unknown';
  }
}

export class AnyType extends TypeNode<Record<string, never>> {
  _type = 'any' as const;
  satisfiedBy(): boolean {
    return false;
  }
  resolve() {
    return this;
  }
  toString(): string {
    return 'any';
  }
}

export interface IArrayType<M extends Type> {
  member: M;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ArrayType<M extends Type> extends IArrayType<M> {}
export class ArrayType<M extends Type> extends TypeNode<IArrayType<M>> {
  _type = 'array' as const;
  satisfiedBy(type: Type): boolean {
    if (!(type instanceof ArrayType) && !(type instanceof TupleType)) {
      return false;
    }

    if (type instanceof ArrayType) {
      return this.member.satisfiedBy(type.member);
    } else if (type instanceof TupleType) {
      return type.members.every((member) => this.member.satisfiedBy(member));
    } else {
      return false;
    }
  }
  resolve() {
    return this;
  }
  toString(): string {
    return `Array<${this.member.toString()}>`;
  }
}

export interface ITupleType<M extends [...Type[]]> {
  members: M;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TupleType<M extends [...Type[]]> extends ITupleType<M> {}
export class TupleType<M extends [...Type[]]> extends TypeNode<ITupleType<M>> {
  _type = 'tuple' as const;
  satisfiedBy(type: Type): boolean {
    if (!(type instanceof TupleType)) {
      return false;
    }

    // TODO: check logic when spreads etc involved
    return this.members.every(
      (member, idx) =>
        type.members[idx] && member.satisfiedBy(type.members[idx])
    );
  }
  resolve() {
    return this;
  }
  toString(): string {
    return `[${this.members.map((m) => m.toString()).join(', ')}]`;
  }
}

/*interface ISpreadType {
  value: ArrayType;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SpreadType extends ISpreadType {}
class SpreadType extends TypeNode<ISpreadType> {
  _type = 'spread' as const;
  satisfiedBy(type: Type): boolean {
    return this.value.satisfiedBy(type);
  }
  resolve() {
    return this;
  }
}*/

export interface IUnionType<M extends [...Type[]]> {
  members: M;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UnionType<M extends [...Type[]]> extends IUnionType<M> {}
export class UnionType<M extends [...Type[]]> extends TypeNode<IUnionType<M>> {
  _type = 'union' as const;
  satisfiedBy(type: Type): boolean {
    if (type instanceof UnionType) {
      return type.members.every((m) =>
        this.members.some((member) => member.satisfiedBy(m))
      );
    }

    return this.members.some((member) => member.satisfiedBy(type));
  }
  resolve() {
    return this;
  }
  toString(): string {
    return this.members.map((m) => m.toString()).join(' | ');
  }
}

/*interface IIntersectionType {
  members: InterfaceType[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IntersectionType extends IIntersectionType {}
class IntersectionType extends TypeNode<IIntersectionType> {
  _type = 'intersection' as const;
  satisfiedBy(type: Type): boolean {
    // TODO: handle other intersection types
    if (!(type instanceof InterfaceType)) return false;

    const fields = this.members.map((m) => m.members).flat();
    return fields.every(([key, value]) => {
      const matching = type.members.find(([k]) => k === key);
      return matching && value.satisfiedBy(matching[1]);
    });
  }
  resolve() {
    return this;
  }
} */

// alias type is just assigning a variable

export interface IInterfaceType<M extends [string, Type][]> {
  members: M;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterfaceType<M extends [string, Type][]>
  extends IInterfaceType<M> {}
export class InterfaceType<M extends [string, Type][]> extends TypeNode<
  IInterfaceType<M>
> {
  _type = 'interface' as const;
  satisfiedBy(type: Type): boolean {
    if (!(type instanceof InterfaceType)) return false;

    return this.members.every(([key, value]) => {
      const matching = type.members.find(([k]) => k === key);
      return matching && value.satisfiedBy(matching[1]);
    });
  }
  resolve() {
    return this;
  }
  toString(): string {
    return (
      '{' +
      this.members
        .map(([key, value]) => `${key}: ${value.toString}`)
        .join(', ') +
      '}'
    );
  }
}

export interface IGenericType {
  key: string;
  genericValues: FunctionGenericValues;
  extends?: Type;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GenericType extends IGenericType {}
export class GenericType extends TypeNode<IGenericType> {
  _type = 'generic' as const;
  satisfiedBy(type: Type): boolean {
    this.genericValues[this.key] = (this.genericValues[this.key] || []).concat([
      type,
    ]);
    if (!this.extends) {
      return true;
    }

    return this.extends.satisfiedBy(type);
  }
  resolve() {
    if (this.genericValues[this.key].length === 1) {
      return this.genericValues[this.key][0];
    }
    return new UnionType({ members: this.genericValues[this.key] });
  }
  toString(): string {
    return `Unresolved Generic <${this.key}>`;
  }
}

export interface ILiteralType<T> {
  value: T;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LiteralType<T> extends ILiteralType<T> {}
export class LiteralType<T> extends TypeNode<ILiteralType<T>> {
  _type = 'literal' as const;
  satisfiedBy(type: Type): boolean {
    if (!(type instanceof LiteralType)) return false;

    return type.value === this.value;
  }
  resolve() {
    return this;
  }
  toString(): string {
    return `Literal<${this.value}>`;
  }
}

/*interface ConditionalType {
  condition: unknown; // This needs to be clever using generic values
  trueValue: Type;
  falseValue: Type;
}
class ConditionalType extends TypeNode<ConditionalType> {}*/

/*interface MappedType<T extends InterfaceType, U extends InterfaceType> {
  input: T;
  output: U;
}
class MappedType<
  T extends InterfaceType,
  U extends InterfaceType
> extends TypeNode<MappedType<T, U>> {}*/

export type Type =
  | PrimitiveType<DataType>
  | NeverType
  | UnknownType
  | AnyType
  | ArrayType<Type>
  | UnionType<[...Type[]]>
  | InterfaceType<[string, Type][]>
  | GenericType
  | LiteralType<unknown>
  | TupleType<[...Type[]]>;

/**
 * string
 * string | number | boolean
 * Foo & {bar: string}
 * string[]
 * {
 *   foo?: string,
 * }
 * {
 *   [k in keyof Thing]: Thing[k]
 * }
 *
 *
 * - primitive
 * - array
 * - spread
 * - tuple
 * - union
 * - intersection
 * - alias
 * - interface
 * - generic
 * - literal
 * - conditional
 * - mapped
 */
export const primitives = new UnionType({
  members: [
    new PrimitiveType({ name: 'string' }),
    new PrimitiveType({ name: 'number' }),
    new PrimitiveType({ name: 'boolean' }),
    new PrimitiveType({ name: 'json' }),
    new PrimitiveType({ name: 'date' }),
  ],
});

export function union<T extends [...Type[]]>(...types: T) {
  return new UnionType({
    members: types,
  });
}

export function array<T extends Type>(type: T) {
  return new ArrayType({
    member: type,
  });
}

export function tuple<T extends [...Type[]]>(...types: T) {
  return new TupleType({
    members: types,
  });
}

export function generic(
  key: string,
  genericValues: FunctionGenericValues,
  ext?: Type
) {
  return new GenericType({ key, extends: ext, genericValues });
}

export const unknown = new UnknownType({});
export const never = new NeverType({});

export const dataTypes: { [K in DataType]: PrimitiveType<K> } = {
  string: new PrimitiveType({ name: 'string' }),
  number: new PrimitiveType({ name: 'number' }),
  boolean: new PrimitiveType({ name: 'boolean' }),
  json: new PrimitiveType({ name: 'json' }),
  date: new PrimitiveType({ name: 'date' }),
};

export type FunctionSignature = {
  args:
    | ArrayType<Type>
    | TupleType<Type[]>
    | UnionType<(ArrayType<Type> | TupleType<Type[]>)[]>;
  return: Type;
};

export type FunctionGenericValues = {
  [K: string]: Type[];
};

export type FunctionDef = {
  name: string;
  signature:
    | FunctionSignature
    | ((generics: FunctionGenericValues) => FunctionSignature);
  modifiers?: readonly string[];
};

export type TransformDef = {
  name: string;
  signature: {
    args: ArrayType<Type> | TupleType<Type[]>;
  };
  modifiers?: readonly string[];
};

// Typescript type inference

type PrimitiveMap = {
  string: string;
  number: number;
  boolean: boolean;
  json: Record<string, unknown>;
  date: Date;
};

export type UnionForTs<T extends UnionType<[...Type[]]>> = TupleMembersForTs<
  T['members']
>[number];

export type ArrayForTs<T extends ArrayType<Type>> = Array<
  TypeForTs<T['member']>
>;

export type TupleForTs<T extends TupleType<[...Type[]]>> = TupleMembersForTs<
  T['members']
>;

export type TupleMembersForTs<T extends [...Type[]]> = {
  [Index in keyof T]: TypeForTs<T[Index]>;
} & { length: T['length'] };

export type InterfaceForTs<T extends InterfaceType<[string, Type][]>> = {
  [K in T['members'][number] as K[0]]: TypeForTs<K[1]>;
};

export type TypeForTs<T extends Type> = T extends PrimitiveType<DataType>
  ? PrimitiveMap[T['name']]
  : T extends UnionType<[...Type[]]>
  ? UnionForTs<T>
  : T extends ArrayType<Type>
  ? ArrayForTs<T>
  : T extends TupleType<[...Type[]]>
  ? TupleForTs<T>
  : T extends InterfaceType<[string, Type][]>
  ? InterfaceForTs<T>
  : T extends LiteralType<unknown>
  ? T['value']
  : T extends UnknownType
  ? unknown
  : T extends AnyType
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  : never;
