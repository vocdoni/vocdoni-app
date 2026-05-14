interface ResponsiveArray<Length extends number, Value> extends ReadonlyArray<Value> {
    0: Value;
    length: Length;
}
interface RequiredResponsiveArray<Length extends number, Value> extends ReadonlyArray<Value> {
    0: Exclude<Value, null>;
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

export { type ConditionalValue, type RequiredConditionalValue, createMapValueFn, createNormalizeValueFn };
