import { CSSProperties, StyleRule } from '@vanilla-extract/css';

interface ResponsiveArray<Length extends number, Value> extends ReadonlyArray<Value> {
    0: Value;
    length: Length;
}
interface RequiredResponsiveArray<Length extends number, Value> extends ReadonlyArray<Value> {
    0: Exclude<Value, null>;
    length: Length;
}
type ResponsiveArrayConfig<Value> = ResponsiveArray<2 | 3 | 4 | 5 | 6 | 7 | 8, Value>;
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
type RequiredResponsiveArrayByMaxLength<MaxLength extends number, Value> = [
    never,
    RequiredResponsiveArray<1, Value | null>,
    RequiredResponsiveArray<1 | 2, Value | null>,
    RequiredResponsiveArray<1 | 2 | 3, Value | null>,
    RequiredResponsiveArray<1 | 2 | 3 | 4, Value | null>,
    RequiredResponsiveArray<1 | 2 | 3 | 4 | 5, Value | null>,
    RequiredResponsiveArray<1 | 2 | 3 | 4 | 5 | 6, Value | null>,
    RequiredResponsiveArray<1 | 2 | 3 | 4 | 5 | 6 | 7, Value | null>,
    RequiredResponsiveArray<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, Value | null>
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

type ExtractValue<Value extends string | number | boolean | Partial<Record<string, string | number | boolean>> | ResponsiveArrayByMaxLength<number, string | number | boolean | null>> = Value extends ResponsiveArrayByMaxLength<number, string | number | boolean | null> ? NonNullable<Value[number]> : Value extends Partial<Record<string, string | number | boolean>> ? NonNullable<Value[keyof Value]> : Value;
type Conditions<ConditionName extends string> = {
    conditions: {
        defaultCondition: ConditionName | false;
        conditionNames: Array<ConditionName>;
        responsiveArray?: Array<ConditionName>;
    };
};
type ExtractDefaultCondition<SprinklesProperties extends Conditions<string>> = SprinklesProperties['conditions']['defaultCondition'];
type ExtractConditionNames<SprinklesProperties extends Conditions<string>> = SprinklesProperties['conditions']['conditionNames'][number];
type ConditionalValue<SprinklesProperties extends Conditions<string>, Value extends string | number | boolean> = (ExtractDefaultCondition<SprinklesProperties> extends false ? never : Value) | Partial<Record<ExtractConditionNames<SprinklesProperties>, Value>> | (SprinklesProperties['conditions']['responsiveArray'] extends {
    length: number;
} ? ResponsiveArrayByMaxLength<SprinklesProperties['conditions']['responsiveArray']['length'], Value> : never);
type RequiredConditionalObject<RequiredConditionName extends string, OptionalConditionNames extends string, Value extends string | number | boolean> = Record<RequiredConditionName, Value> & Partial<Record<OptionalConditionNames, Value>>;
type RequiredConditionalValue<SprinklesProperties extends Conditions<string>, Value extends string | number | boolean> = ExtractDefaultCondition<SprinklesProperties> extends false ? never : Value | RequiredConditionalObject<Exclude<ExtractDefaultCondition<SprinklesProperties>, false>, Exclude<ExtractConditionNames<SprinklesProperties>, ExtractDefaultCondition<SprinklesProperties>>, Value> | (SprinklesProperties['conditions']['responsiveArray'] extends {
    length: number;
} ? RequiredResponsiveArrayByMaxLength<SprinklesProperties['conditions']['responsiveArray']['length'], Value> : never);
declare function createNormalizeValueFn<SprinklesProperties extends Conditions<string>>(properties: SprinklesProperties): <Value extends string | number | boolean>(value: ConditionalValue<SprinklesProperties, Value>) => Partial<Record<ExtractConditionNames<SprinklesProperties>, Value>>;
declare function createMapValueFn<SprinklesProperties extends Conditions<string>>(properties: SprinklesProperties): <OutputValue extends string | number | boolean | null | undefined, Value extends ConditionalValue<SprinklesProperties, string | number | boolean>>(value: Value, fn: (inputValue: ExtractValue<Value>, key: ExtractConditionNames<SprinklesProperties>) => OutputValue) => Value extends string | number | boolean ? OutputValue : Partial<Record<ExtractConditionNames<SprinklesProperties>, OutputValue>>;

type ConditionKey = '@media' | '@supports' | '@container' | 'selector';
type Condition = Partial<Record<ConditionKey, string>>;
type BaseConditions = {
    [conditionName: string]: Condition;
};
type AtomicCSSProperties = {
    [Property in keyof CSSProperties]?: Record<string, CSSProperties[Property] | Omit<StyleRule, ConditionKey>> | ReadonlyArray<CSSProperties[Property]>;
};
type AtomicCustomProperties = Record<string, Record<string | number, Omit<StyleRule, ConditionKey>>>;
type AtomicProperties = AtomicCSSProperties | AtomicCustomProperties;
type ShorthandOptions<Properties extends AtomicProperties, Shorthands extends {
    [shorthandName: string]: Array<keyof Properties>;
}> = {
    shorthands: Shorthands;
};
type UnconditionalAtomicOptions<Properties extends AtomicProperties> = {
    '@layer'?: string;
    properties: Properties;
};
type ResponsiveArrayOptions<Conditions extends {
    [conditionName: string]: Condition;
}, ResponsiveLength extends number> = {
    responsiveArray: ResponsiveArrayConfig<keyof Conditions> & {
        length: ResponsiveLength;
    };
};
type ConditionalAtomicOptions<Properties extends AtomicProperties, Conditions extends {
    [conditionName: string]: Condition;
}, DefaultCondition extends keyof Conditions | Array<keyof Conditions> | false> = UnconditionalAtomicOptions<Properties> & {
    conditions: Conditions;
    defaultCondition: DefaultCondition;
};
type Values<Property, Result> = {
    [Value in Property extends ReadonlyArray<any> ? Property[number] : Property extends Array<any> ? Property[number] : keyof Property]: Result;
};
type UnconditionalAtomicStyles<Properties extends AtomicProperties> = {
    conditions: never;
    styles: {
        [Property in keyof Properties]: {
            values: Values<Properties[Property], {
                defaultClass: string;
            }>;
        };
    };
};
type ConditionalAtomicStyles<Properties extends AtomicProperties, Conditions extends {
    [conditionName: string]: Condition;
}, DefaultCondition extends keyof Conditions | Array<keyof Conditions> | false> = {
    conditions: {
        defaultCondition: DefaultCondition;
        conditionNames: Array<keyof Conditions>;
    };
    styles: {
        [Property in keyof Properties]: {
            values: Values<Properties[Property], {
                defaultClass: DefaultCondition extends false ? undefined : string;
                conditions: {
                    [Rule in keyof Conditions]: string;
                };
            }>;
        };
    };
};
type ConditionalWithResponsiveArrayAtomicStyles<Properties extends AtomicProperties, Conditions extends {
    [conditionName: string]: Condition;
}, ResponsiveLength extends number, DefaultCondition extends keyof Conditions | Array<keyof Conditions> | false> = {
    conditions: {
        defaultCondition: DefaultCondition;
        conditionNames: Array<keyof Conditions>;
        responsiveArray: Array<keyof Conditions> & {
            length: ResponsiveLength;
        };
    };
    styles: {
        [Property in keyof Properties]: {
            responsiveArray: Array<keyof Conditions> & {
                length: ResponsiveLength;
            };
            values: Values<Properties[Property], {
                defaultClass: DefaultCondition extends false ? undefined : string;
                conditions: {
                    [Rule in keyof Conditions]: string;
                };
            }>;
        };
    };
};
type ShorthandAtomicStyles<Shorthands extends {
    [shorthandName: string]: Array<string | number | symbol>;
}> = {
    styles: {
        [Shorthand in keyof Shorthands]: {
            mappings: Shorthands[Shorthand];
        };
    };
};
declare function defineProperties<Properties extends AtomicProperties, ResponsiveLength extends number, Conditions extends BaseConditions, Shorthands extends {
    [shorthandName: string]: Array<keyof Properties>;
}, DefaultCondition extends keyof Conditions | Array<keyof Conditions> | false>(options: ConditionalAtomicOptions<Properties, Conditions, DefaultCondition> & ShorthandOptions<Properties, Shorthands> & ResponsiveArrayOptions<Conditions, ResponsiveLength>): ConditionalWithResponsiveArrayAtomicStyles<Properties, Conditions, ResponsiveLength, DefaultCondition> & ShorthandAtomicStyles<Shorthands>;
declare function defineProperties<Properties extends AtomicProperties, Conditions extends BaseConditions, Shorthands extends {
    [shorthandName: string]: Array<keyof Properties>;
}, DefaultCondition extends keyof Conditions | Array<keyof Conditions> | false>(options: ConditionalAtomicOptions<Properties, Conditions, DefaultCondition> & ShorthandOptions<Properties, Shorthands>): ConditionalAtomicStyles<Properties, Conditions, DefaultCondition> & ShorthandAtomicStyles<Shorthands>;
declare function defineProperties<Properties extends AtomicProperties, Conditions extends BaseConditions, ResponsiveLength extends number, DefaultCondition extends keyof Conditions | Array<keyof Conditions> | false>(options: ConditionalAtomicOptions<Properties, Conditions, DefaultCondition> & ResponsiveArrayOptions<Conditions, ResponsiveLength>): ConditionalWithResponsiveArrayAtomicStyles<Properties, Conditions, ResponsiveLength, DefaultCondition>;
declare function defineProperties<Properties extends AtomicProperties, Conditions extends BaseConditions, DefaultCondition extends keyof Conditions | Array<keyof Conditions> | false>(options: ConditionalAtomicOptions<Properties, Conditions, DefaultCondition>): ConditionalAtomicStyles<Properties, Conditions, DefaultCondition>;
declare function defineProperties<Properties extends AtomicProperties, Shorthands extends {
    [shorthandName: string]: Array<keyof Properties>;
}>(options: UnconditionalAtomicOptions<Properties> & ShorthandOptions<Properties, Shorthands>): UnconditionalAtomicStyles<Properties> & ShorthandAtomicStyles<Shorthands>;
declare function defineProperties<Properties extends AtomicProperties>(options: UnconditionalAtomicOptions<Properties>): UnconditionalAtomicStyles<Properties>;
declare function createSprinkles<Args extends ReadonlyArray<SprinklesProperties>>(...config: Args): SprinklesFn<Args>;
/** @deprecated - Use `defineProperties` */
declare const createAtomicStyles: typeof defineProperties;
/** @deprecated - Use `createSprinkles` */
declare const createAtomsFn: typeof createSprinkles;

export { type ConditionalValue, type RequiredConditionalValue, type ResponsiveArray, type SprinklesProperties, createAtomicStyles, createAtomsFn, createMapValueFn, createNormalizeValueFn, createSprinkles, defineProperties };
