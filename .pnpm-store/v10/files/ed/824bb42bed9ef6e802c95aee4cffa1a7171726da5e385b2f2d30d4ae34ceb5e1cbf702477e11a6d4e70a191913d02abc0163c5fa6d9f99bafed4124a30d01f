export { crawlOutDir };
import { serverEntryFileNameBase, serverEntryFileNameBaseAlternative, serverIndexFileNameBase } from '../shared/serverEntryFileNameBase.js';
type OutFileSearch = [typeof serverEntryFileNameBase, typeof serverEntryFileNameBaseAlternative] | [typeof serverIndexFileNameBase];
declare function crawlOutDir({ outDir, tolerateDoesNotExist, outFileSearch, }: {
    outDir?: string;
    tolerateDoesNotExist?: boolean;
    outFileSearch: OutFileSearch;
}): Promise<false | string>;
