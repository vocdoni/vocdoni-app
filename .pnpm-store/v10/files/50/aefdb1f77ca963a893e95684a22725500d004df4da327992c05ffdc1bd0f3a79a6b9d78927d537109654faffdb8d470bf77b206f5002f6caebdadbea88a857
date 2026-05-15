interface ResponsiveArray<Length extends number, Value> extends ReadonlyArray<Value> {
    0: Value;
    length: Length;
}
type ResponsiveArrayByMaxLength<MaxLength extends number, Value> = [
    never,
    ResponsiveArray<1, Value | null>,
    ResponsiveArray<1 | 2, Value | null>,
    ResponsiveArray<1 | 2 | 3, Value | null>,
    ResponsiveArray<1 | 2 | 3 | 4, Value | null>,
    ResponsiveArray<1 | 2 | 3 | 4 | 5, Value | null>,
    ResponsiveArray<1 | 2 | 3 | 4 | 5 | 6, Value | null>,
    ResponsiveArray<1 | 2 | 3 | 4 | 5 | 6 | 7, Value | null>,
    ResponsiveArray<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, Value | null>
][MaxLength];
type ConditionalPropertyValue = {
    defaultClass: string | undefined;
    conditions: {
        [conditionName: string]: string;
    };
};
type ConditionalWithResponsiveArrayProperty = {
    responsiveArray: Array<string>;
    values: {
        [valueName: string]: ConditionalPropertyValue;
    };
};
type ConditionalProperty = {
    values: {
        [valueName: string]: ConditionalPropertyValue;
    };
};
type UnconditionalProperty = {
    values: {
        [valueName: string]: {
            defaultClass: string;
        };
    };
};
type ShorthandProperty = {
    mappings: Array<string>;
};
type SprinklesProperties = {
    styles: {
        [property: string]: ConditionalWithResponsiveArrayProperty | ConditionalProperty | ShorthandProperty | UnconditionalProperty;
    };
};

type ResponsiveArrayVariant<RA extends {
    length: number;
}, Values extends string | number | symbol> = ResponsiveArrayByMaxLength<RA['length'], Values | null>;
type ConditionalStyle<Values extends {
    [key: string]: ConditionalPropertyValue;
}> = (Values[keyof Values]['defaultClass'] extends string ? keyof Values : never) | {
    [Condition in keyof Values[keyof Values]['conditions']]?: keyof Values;
} | undefined;
type ConditionalStyleWithResponsiveArray<Values extends {
    [key: string]: ConditionalPropertyValue;
}, RA extends {
    length: number;
}> = ConditionalStyle<Values> | ResponsiveArrayVariant<RA, keyof Values>;
type ChildSprinkleProps<Sprinkles extends SprinklesProperties['styles']> = {
    [Prop in keyof Sprinkles]?: Sprinkles[Prop] extends ConditionalWithResponsiveArrayProperty ? ConditionalStyleWithResponsiveArray<Sprinkles[Prop]['values'], Sprinkles[Prop]['responsiveArray']> : Sprinkles[Prop] extends ConditionalProperty ? ConditionalStyle<Sprinkles[Prop]['values']> : Sprinkles[Prop] extends ShorthandProperty ? Sprinkles[Sprinkles[Prop]['mappings'][number]] extends ConditionalWithResponsiveArrayProperty ? ConditionalStyleWithResponsiveArray<Sprinkles[Sprinkles[Prop]['mappings'][number]]['values'], Sprinkles[Sprinkles[Prop]['mappings'][number]]['responsiveArray']> : Sprinkles[Sprinkles[Prop]['mappings'][number]] extends ConditionalProperty ? ConditionalStyle<Sprinkles[Sprinkles[Prop]['mappings'][number]]['values']> : Sprinkles[Sprinkles[Prop]['mappings'][number]] extends UnconditionalProperty ? keyof Sprinkles[Sprinkles[Prop]['mappings'][number]]['values'] | undefined : never : Sprinkles[Prop] extends UnconditionalProperty ? keyof Sprinkles[Prop]['values'] | undefined : never;
};
type SprinkleProps<Args extends ReadonlyArray<any>> = Args extends [
    infer L,
    ...infer R
] ? (L extends SprinklesProperties ? ChildSprinkleProps<L['styles']> : never) & SprinkleProps<R> : {};
type SprinklesFn<Args extends ReadonlyArray<SprinklesProperties>> = ((props: SprinkleProps<Args>) => string) & {
    properties: Set<keyof SprinkleProps<Args>>;
};

declare const createSprinkles: <Args extends ReadonlyArray<SprinklesProperties>>(...args: Args) => SprinklesFn<Args>;
/** @deprecated - Use `createSprinkles` */
declare const createAtomsFn: <Args extends ReadonlyArray<SprinklesProperties>>(...args: Args) => SprinklesFn<Args>;

export { createAtomsFn, createSprinkles };
