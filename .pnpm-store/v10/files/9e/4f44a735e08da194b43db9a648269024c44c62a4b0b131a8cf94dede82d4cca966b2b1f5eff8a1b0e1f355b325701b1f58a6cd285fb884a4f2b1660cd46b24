import { z } from "zod";
export declare const compositionFileSchema: z.ZodObject<{
    type: z.ZodString;
    id: z.ZodString;
    file: z.ZodObject<{
        name: z.ZodString;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        content: string;
    }, {
        name: string;
        content: string;
    }>;
    component: z.ZodString;
    npmDependencies: z.ZodArray<z.ZodString, "many">;
    fileDependencies: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    file: {
        name: string;
        content: string;
    };
    component: string;
    npmDependencies: string[];
    fileDependencies: string[];
}, {
    type: string;
    id: string;
    file: {
        name: string;
        content: string;
    };
    component: string;
    npmDependencies: string[];
    fileDependencies: string[];
}>;
export interface CompositionFile extends z.infer<typeof compositionFileSchema> {
}
export declare const compositionIndexSchema: z.ZodArray<z.ZodObject<{
    type: z.ZodString;
    id: z.ZodString;
    file: z.ZodString;
    component: z.ZodString;
    npmDependencies: z.ZodArray<z.ZodString, "many">;
    fileDependencies: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    file: string;
    component: string;
    npmDependencies: string[];
    fileDependencies: string[];
}, {
    type: string;
    id: string;
    file: string;
    component: string;
    npmDependencies: string[];
    fileDependencies: string[];
}>, "many">;
export interface Compositions extends z.infer<typeof compositionIndexSchema> {
}
export declare const processEnvSchema: z.ZodObject<{
    REGISTRY_URL: z.ZodDefault<z.ZodString>;
    HTTPS_PROXY: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    REGISTRY_URL: string;
    HTTPS_PROXY?: string | undefined;
}, {
    REGISTRY_URL?: string | undefined;
    HTTPS_PROXY?: string | undefined;
}>;
export declare const addCommandFlagsSchema: z.ZodObject<{
    force: z.ZodOptional<z.ZodBoolean>;
    dryRun: z.ZodOptional<z.ZodBoolean>;
    outdir: z.ZodOptional<z.ZodString>;
    all: z.ZodOptional<z.ZodBoolean>;
    tsx: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    tsx?: boolean | undefined;
    all?: boolean | undefined;
    force?: boolean | undefined;
    dryRun?: boolean | undefined;
    outdir?: string | undefined;
}, {
    tsx?: boolean | undefined;
    all?: boolean | undefined;
    force?: boolean | undefined;
    dryRun?: boolean | undefined;
    outdir?: string | undefined;
}>;
export interface AddCommandFlags extends z.infer<typeof addCommandFlagsSchema> {
}
