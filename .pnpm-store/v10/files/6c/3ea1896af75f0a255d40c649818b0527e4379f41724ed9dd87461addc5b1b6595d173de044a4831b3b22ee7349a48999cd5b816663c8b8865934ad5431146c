interface ChakraProBlockVariant {
    id: string;
    name: string;
    categoryId: string;
    accessLevel: "free" | "pro";
}
interface ChakraProBlock {
    id: string;
    name: string;
    group: string;
    description: string;
    figmaNodeId: string;
    variants: ChakraProBlockVariant[];
}
interface ChakraProBlocksResponse {
    data: ChakraProBlock[];
}
export declare function fetchCompositions(): Promise<{
    type: string;
    id: string;
    file: string;
    component: string;
    npmDependencies: string[];
    fileDependencies: string[];
}[]>;
export declare function fetchComposition(id: string): Promise<{
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
export declare function fetchProBlocks(): Promise<ChakraProBlocksResponse>;
export declare function fetchProBlock(category: string, id: string, apiKey: string): Promise<any>;
export {};
