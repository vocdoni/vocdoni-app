export { assertFilePathAbsoluteFilesystem };
export { isFilePathAbsoluteFilesystem };
export { isFilePathAbsolute };
/**
 * Asserts that `filePath` is an absolute file path starting from the filesystem root.
 *
 * It isn't reliable for Linux users, but that's okay because the assertion will eventually fail on windows.
 */
declare function assertFilePathAbsoluteFilesystem(filePath: string): void;
/**
 * Whether `filePath` is an absolute file path starting from the filesystem root.
 *
 * Isn't reliable for Linux users: it returns `true` for an absolute path starting from the user root dir.
 */
declare function isFilePathAbsoluteFilesystem(filePath: string): boolean;
/**
 * Whether `filePath` is an absolute file path.
 *
 * Returns `true` regardless whether it starts from the user root dir or filesystem root.
 */
declare function isFilePathAbsolute(filePath: string): boolean;
