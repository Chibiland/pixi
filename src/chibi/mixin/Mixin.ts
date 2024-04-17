import {Class, UnionToIntersection} from "../utils/type_utils";
import getMethods from "../utils/getMethods";


export type ClassArrayType<T> = T extends Array<Class<infer U>> ? U : never;

export type ClassArrayTypeOmit<T, toOmit extends string> = ClassArrayType<T> & { [key in toOmit]: never };

type MixinClassEntry = [name: string, clazz: Class<any>];

type MixinClassEntriesToClasses<T extends Array<MixinClassEntry>> = {
    [K in keyof T]: T[K][1];
}

// type that to an object mapping the names to corresponding classes
type MixinClassEntriesToObjectArray<T extends Array<MixinClassEntry>> = {
    [K in keyof T]: {
        [key in T[K][0]]: InstanceType<T[K][1]>
    }
}

// merge the object mapping the names to corresponding classes into a single object
type MixinClassesEntries<T extends Array<MixinClassEntry>> = UnionToIntersection<MixinClassEntriesToObjectArray<T>[number]>;

export class Mixed {
    protected mixin<T extends object, T2 extends T>(this: T2, target: T): T2 {
        return assignMixin(this, target)
    }
}

export default function Mixin<Base extends Class<any>, A extends Array<MixinClassEntry>>(Base: Base, ...classes: A):
    Class<
        InstanceType<Base>
        & UnionToIntersection<ClassArrayType<MixinClassEntriesToClasses<A>>>
        & MixinClassesEntries<A>
        & Mixed
    > {

    // @ts-ignore keep method protected
    Base.prototype.mixin = Mixed.prototype.mixin;

    Base.prototype.__mixinClasses = classes.reduce((acc, [name, clazz]) => {
        acc.set(clazz, name);
        return acc;
    }, new Map());

    return Base as any;
}

export function assignMixin<T extends object, T2 extends T>(target: T2, mixin: T): T2 {
    /*
    TODO: evaluate performances of this implementation which relates on getters and setters proxies
    Possible alternative: assign methods directly to the target object prototype and use assignMixin only to assign attributes.
    Problem: could lead to conflicts with other mixins (e.g. two mixins with the same attribute or method name) but the choice can be left to the user on per mixin basis.
    */
    for (const key of getMethods(mixin)) {
        if (key in target) continue;

        Object.defineProperty(target, key, {
            get: () => mixin[key],
            set: (value) => mixin[key] = value
        });
    }
    for (const key in mixin) {
        if (key in target) continue;

        Object.defineProperty(target, key, {
            get: () => mixin[key],
            set: (value) => mixin[key] = value
        });
    }
    //@ts-ignore
    target[target.constructor.prototype.__mixinClasses.get(mixin.constructor)] = mixin;

    return target;
}
