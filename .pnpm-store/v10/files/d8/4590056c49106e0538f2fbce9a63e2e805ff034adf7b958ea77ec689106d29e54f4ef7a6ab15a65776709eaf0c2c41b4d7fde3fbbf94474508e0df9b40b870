import _m0 from 'protobufjs/minimal';
import { l as EntityReference } from './entity-e8dfcd83.js';

declare enum Wallet_AuthMethod {
    PASS = 0,
    PIN = 1,
    UNRECOGNIZED = -1
}
declare function wallet_AuthMethodFromJSON(object: any): Wallet_AuthMethod;
declare function wallet_AuthMethodToJSON(object: Wallet_AuthMethod): string;
/** / An encrypted wallet with the details to allow its usage, given a passphrase or a pin */
interface Wallet {
    /**
     * / Human friendly seed phrase, derived with an HD path to produce a root private key
     * / The root private key will still be uniquely derived for each entity
     */
    encryptedMnemonic: Uint8Array;
    hdPath: string;
    locale: string;
    authMethod: Wallet_AuthMethod;
}
declare const Wallet: {
    encode(message: Wallet, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Wallet;
    fromJSON(object: any): Wallet;
    toJSON(message: Wallet): unknown;
    create<I extends {
        encryptedMnemonic?: Uint8Array | undefined;
        hdPath?: string | undefined;
        locale?: string | undefined;
        authMethod?: Wallet_AuthMethod | undefined;
    } & {
        encryptedMnemonic?: Uint8Array | undefined;
        hdPath?: string | undefined;
        locale?: string | undefined;
        authMethod?: Wallet_AuthMethod | undefined;
    } & { [K in Exclude<keyof I, keyof Wallet>]: never; }>(base?: I | undefined): Wallet;
    fromPartial<I_1 extends {
        encryptedMnemonic?: Uint8Array | undefined;
        hdPath?: string | undefined;
        locale?: string | undefined;
        authMethod?: Wallet_AuthMethod | undefined;
    } & {
        encryptedMnemonic?: Uint8Array | undefined;
        hdPath?: string | undefined;
        locale?: string | undefined;
        authMethod?: Wallet_AuthMethod | undefined;
    } & { [K_1 in Exclude<keyof I_1, keyof Wallet>]: never; }>(object: I_1): Wallet;
};

declare const wallet_Wallet: typeof Wallet;
type wallet_Wallet_AuthMethod = Wallet_AuthMethod;
declare const wallet_Wallet_AuthMethod: typeof Wallet_AuthMethod;
declare const wallet_wallet_AuthMethodFromJSON: typeof wallet_AuthMethodFromJSON;
declare const wallet_wallet_AuthMethodToJSON: typeof wallet_AuthMethodToJSON;
declare namespace wallet {
  export {
    wallet_Wallet as Wallet,
    wallet_Wallet_AuthMethod as Wallet_AuthMethod,
    wallet_wallet_AuthMethodFromJSON as wallet_AuthMethodFromJSON,
    wallet_wallet_AuthMethodToJSON as wallet_AuthMethodToJSON,
  };
}

/** / Helper to serialize and store a list of entries at once */
interface AccountsStore {
    items: Account[];
}
declare const AccountsStore: {
    encode(message: AccountsStore, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AccountsStore;
    fromJSON(object: any): AccountsStore;
    toJSON(message: AccountsStore): unknown;
    create<I extends {
        items?: {
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        }[] | undefined;
    } & {
        items?: ({
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        }[] & ({
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        } & {
            name?: string | undefined;
            wallet?: ({
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } & {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } & { [K in Exclude<keyof I["items"][number]["wallet"], keyof Wallet>]: never; }) | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: ({
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } & {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                } & {
                    appVoter?: ({
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } & {
                        appAnalyticsID?: string | undefined;
                        entities?: ({
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] & ({
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        } & {
                            entityId?: string | undefined;
                            entryPoints?: (string[] & string[] & { [K_1 in Exclude<keyof I["items"][number]["extra"]["content"]["appVoter"]["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
                        } & { [K_2 in Exclude<keyof I["items"][number]["extra"]["content"]["appVoter"]["entities"][number], keyof EntityReference>]: never; })[] & { [K_3 in Exclude<keyof I["items"][number]["extra"]["content"]["appVoter"]["entities"], keyof {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[]>]: never; }) | undefined;
                    } & { [K_4 in Exclude<keyof I["items"][number]["extra"]["content"]["appVoter"], keyof Account_AppVoter>]: never; }) | undefined;
                    $case: "appVoter";
                } & { [K_5 in Exclude<keyof I["items"][number]["extra"]["content"], "$case" | "appVoter">]: never; }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                } & {
                    webEntity?: ({
                        webAnalyticsID?: string | undefined;
                    } & {
                        webAnalyticsID?: string | undefined;
                    } & { [K_6 in Exclude<keyof I["items"][number]["extra"]["content"]["webEntity"], "webAnalyticsID">]: never; }) | undefined;
                    $case: "webEntity";
                } & { [K_7 in Exclude<keyof I["items"][number]["extra"]["content"], "$case" | "webEntity">]: never; }) | undefined;
            } & { [K_8 in Exclude<keyof I["items"][number]["extra"], "content">]: never; }) | undefined;
            meta?: ({
                [x: string]: string | undefined;
            } & {
                [x: string]: string | undefined;
            } & { [K_9 in Exclude<keyof I["items"][number]["meta"], string | number>]: never; }) | undefined;
        } & { [K_10 in Exclude<keyof I["items"][number], keyof Account>]: never; })[] & { [K_11 in Exclude<keyof I["items"], keyof {
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_12 in Exclude<keyof I, "items">]: never; }>(base?: I | undefined): AccountsStore;
    fromPartial<I_1 extends {
        items?: {
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        }[] | undefined;
    } & {
        items?: ({
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        }[] & ({
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        } & {
            name?: string | undefined;
            wallet?: ({
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } & {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } & { [K_13 in Exclude<keyof I_1["items"][number]["wallet"], keyof Wallet>]: never; }) | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: ({
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } & {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                } & {
                    appVoter?: ({
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } & {
                        appAnalyticsID?: string | undefined;
                        entities?: ({
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] & ({
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        } & {
                            entityId?: string | undefined;
                            entryPoints?: (string[] & string[] & { [K_14 in Exclude<keyof I_1["items"][number]["extra"]["content"]["appVoter"]["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
                        } & { [K_15 in Exclude<keyof I_1["items"][number]["extra"]["content"]["appVoter"]["entities"][number], keyof EntityReference>]: never; })[] & { [K_16 in Exclude<keyof I_1["items"][number]["extra"]["content"]["appVoter"]["entities"], keyof {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[]>]: never; }) | undefined;
                    } & { [K_17 in Exclude<keyof I_1["items"][number]["extra"]["content"]["appVoter"], keyof Account_AppVoter>]: never; }) | undefined;
                    $case: "appVoter";
                } & { [K_18 in Exclude<keyof I_1["items"][number]["extra"]["content"], "$case" | "appVoter">]: never; }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                } & {
                    webEntity?: ({
                        webAnalyticsID?: string | undefined;
                    } & {
                        webAnalyticsID?: string | undefined;
                    } & { [K_19 in Exclude<keyof I_1["items"][number]["extra"]["content"]["webEntity"], "webAnalyticsID">]: never; }) | undefined;
                    $case: "webEntity";
                } & { [K_20 in Exclude<keyof I_1["items"][number]["extra"]["content"], "$case" | "webEntity">]: never; }) | undefined;
            } & { [K_21 in Exclude<keyof I_1["items"][number]["extra"], "content">]: never; }) | undefined;
            meta?: ({
                [x: string]: string | undefined;
            } & {
                [x: string]: string | undefined;
            } & { [K_22 in Exclude<keyof I_1["items"][number]["meta"], string | number>]: never; }) | undefined;
        } & { [K_23 in Exclude<keyof I_1["items"][number], keyof Account>]: never; })[] & { [K_24 in Exclude<keyof I_1["items"], keyof {
            name?: string | undefined;
            wallet?: {
                encryptedMnemonic?: Uint8Array | undefined;
                hdPath?: string | undefined;
                locale?: string | undefined;
                authMethod?: Wallet_AuthMethod | undefined;
            } | undefined;
            address?: string | undefined;
            hasBackup?: boolean | undefined;
            extra?: {
                content?: ({
                    appVoter?: {
                        appAnalyticsID?: string | undefined;
                        entities?: {
                            entityId?: string | undefined;
                            entryPoints?: string[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    $case: "appVoter";
                }) | ({
                    webEntity?: {
                        webAnalyticsID?: string | undefined;
                    } | undefined;
                } & {
                    $case: "webEntity";
                }) | undefined;
            } | undefined;
            meta?: {
                [x: string]: string | undefined;
            } | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_25 in Exclude<keyof I_1, "items">]: never; }>(object: I_1): AccountsStore;
};
/** / An account, containing the credentials and info of both entities and app voters */
interface Account {
    /** / The name of the entity or an alias to help users identify the account */
    name: string;
    /** / The underlying root wallet, usable with the original passphrase or pin */
    wallet: Wallet | undefined;
    /** / The root address of the wallet, used to detect duplicate accounts */
    address: string;
    /** / Does the user have a back up of the account? */
    hasBackup: boolean;
    extra: Account_Extra | undefined;
    /**
     * EXTERNAL FIELDS
     * Allow to use arbitrary key/values so that
     * identities can be organized by custom values.
     */
    meta: {
        [key: string]: string;
    };
}
declare const Account: {
    encode(message: Account, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Account;
    fromJSON(object: any): Account;
    toJSON(message: Account): unknown;
    create<I extends {
        name?: string | undefined;
        wallet?: {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } | undefined;
        address?: string | undefined;
        hasBackup?: boolean | undefined;
        extra?: {
            content?: ({
                appVoter?: {
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "appVoter";
            }) | ({
                webEntity?: {
                    webAnalyticsID?: string | undefined;
                } | undefined;
            } & {
                $case: "webEntity";
            }) | undefined;
        } | undefined;
        meta?: {
            [x: string]: string | undefined;
        } | undefined;
    } & {
        name?: string | undefined;
        wallet?: ({
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & { [K in Exclude<keyof I["wallet"], keyof Wallet>]: never; }) | undefined;
        address?: string | undefined;
        hasBackup?: boolean | undefined;
        extra?: ({
            content?: ({
                appVoter?: {
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "appVoter";
            }) | ({
                webEntity?: {
                    webAnalyticsID?: string | undefined;
                } | undefined;
            } & {
                $case: "webEntity";
            }) | undefined;
        } & {
            content?: ({
                appVoter?: {
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "appVoter";
            } & {
                appVoter?: ({
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } & {
                    appAnalyticsID?: string | undefined;
                    entities?: ({
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] & ({
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    } & {
                        entityId?: string | undefined;
                        entryPoints?: (string[] & string[] & { [K_1 in Exclude<keyof I["extra"]["content"]["appVoter"]["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
                    } & { [K_2 in Exclude<keyof I["extra"]["content"]["appVoter"]["entities"][number], keyof EntityReference>]: never; })[] & { [K_3 in Exclude<keyof I["extra"]["content"]["appVoter"]["entities"], keyof {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[]>]: never; }) | undefined;
                } & { [K_4 in Exclude<keyof I["extra"]["content"]["appVoter"], keyof Account_AppVoter>]: never; }) | undefined;
                $case: "appVoter";
            } & { [K_5 in Exclude<keyof I["extra"]["content"], "$case" | "appVoter">]: never; }) | ({
                webEntity?: {
                    webAnalyticsID?: string | undefined;
                } | undefined;
            } & {
                $case: "webEntity";
            } & {
                webEntity?: ({
                    webAnalyticsID?: string | undefined;
                } & {
                    webAnalyticsID?: string | undefined;
                } & { [K_6 in Exclude<keyof I["extra"]["content"]["webEntity"], "webAnalyticsID">]: never; }) | undefined;
                $case: "webEntity";
            } & { [K_7 in Exclude<keyof I["extra"]["content"], "$case" | "webEntity">]: never; }) | undefined;
        } & { [K_8 in Exclude<keyof I["extra"], "content">]: never; }) | undefined;
        meta?: ({
            [x: string]: string | undefined;
        } & {
            [x: string]: string | undefined;
        } & { [K_9 in Exclude<keyof I["meta"], string | number>]: never; }) | undefined;
    } & { [K_10 in Exclude<keyof I, keyof Account>]: never; }>(base?: I | undefined): Account;
    fromPartial<I_1 extends {
        name?: string | undefined;
        wallet?: {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } | undefined;
        address?: string | undefined;
        hasBackup?: boolean | undefined;
        extra?: {
            content?: ({
                appVoter?: {
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "appVoter";
            }) | ({
                webEntity?: {
                    webAnalyticsID?: string | undefined;
                } | undefined;
            } & {
                $case: "webEntity";
            }) | undefined;
        } | undefined;
        meta?: {
            [x: string]: string | undefined;
        } | undefined;
    } & {
        name?: string | undefined;
        wallet?: ({
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & { [K_11 in Exclude<keyof I_1["wallet"], keyof Wallet>]: never; }) | undefined;
        address?: string | undefined;
        hasBackup?: boolean | undefined;
        extra?: ({
            content?: ({
                appVoter?: {
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "appVoter";
            }) | ({
                webEntity?: {
                    webAnalyticsID?: string | undefined;
                } | undefined;
            } & {
                $case: "webEntity";
            }) | undefined;
        } & {
            content?: ({
                appVoter?: {
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "appVoter";
            } & {
                appVoter?: ({
                    appAnalyticsID?: string | undefined;
                    entities?: {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] | undefined;
                } & {
                    appAnalyticsID?: string | undefined;
                    entities?: ({
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[] & ({
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    } & {
                        entityId?: string | undefined;
                        entryPoints?: (string[] & string[] & { [K_12 in Exclude<keyof I_1["extra"]["content"]["appVoter"]["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
                    } & { [K_13 in Exclude<keyof I_1["extra"]["content"]["appVoter"]["entities"][number], keyof EntityReference>]: never; })[] & { [K_14 in Exclude<keyof I_1["extra"]["content"]["appVoter"]["entities"], keyof {
                        entityId?: string | undefined;
                        entryPoints?: string[] | undefined;
                    }[]>]: never; }) | undefined;
                } & { [K_15 in Exclude<keyof I_1["extra"]["content"]["appVoter"], keyof Account_AppVoter>]: never; }) | undefined;
                $case: "appVoter";
            } & { [K_16 in Exclude<keyof I_1["extra"]["content"], "$case" | "appVoter">]: never; }) | ({
                webEntity?: {
                    webAnalyticsID?: string | undefined;
                } | undefined;
            } & {
                $case: "webEntity";
            } & {
                webEntity?: ({
                    webAnalyticsID?: string | undefined;
                } & {
                    webAnalyticsID?: string | undefined;
                } & { [K_17 in Exclude<keyof I_1["extra"]["content"]["webEntity"], "webAnalyticsID">]: never; }) | undefined;
                $case: "webEntity";
            } & { [K_18 in Exclude<keyof I_1["extra"]["content"], "$case" | "webEntity">]: never; }) | undefined;
        } & { [K_19 in Exclude<keyof I_1["extra"], "content">]: never; }) | undefined;
        meta?: ({
            [x: string]: string | undefined;
        } & {
            [x: string]: string | undefined;
        } & { [K_20 in Exclude<keyof I_1["meta"], string | number>]: never; }) | undefined;
    } & { [K_21 in Exclude<keyof I_1, keyof Account>]: never; }>(object: I_1): Account;
};
interface Account_AppVoter {
    /** / Random anonymized id for analytics */
    appAnalyticsID: string;
    /** / Subscribed entities */
    entities: EntityReference[];
}
declare const Account_AppVoter: {
    encode(message: Account_AppVoter, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Account_AppVoter;
    fromJSON(object: any): Account_AppVoter;
    toJSON(message: Account_AppVoter): unknown;
    create<I extends {
        appAnalyticsID?: string | undefined;
        entities?: {
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        }[] | undefined;
    } & {
        appAnalyticsID?: string | undefined;
        entities?: ({
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        }[] & ({
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        } & {
            entityId?: string | undefined;
            entryPoints?: (string[] & string[] & { [K in Exclude<keyof I["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
        } & { [K_1 in Exclude<keyof I["entities"][number], keyof EntityReference>]: never; })[] & { [K_2 in Exclude<keyof I["entities"], keyof {
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_3 in Exclude<keyof I, keyof Account_AppVoter>]: never; }>(base?: I | undefined): Account_AppVoter;
    fromPartial<I_1 extends {
        appAnalyticsID?: string | undefined;
        entities?: {
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        }[] | undefined;
    } & {
        appAnalyticsID?: string | undefined;
        entities?: ({
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        }[] & ({
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        } & {
            entityId?: string | undefined;
            entryPoints?: (string[] & string[] & { [K_4 in Exclude<keyof I_1["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
        } & { [K_5 in Exclude<keyof I_1["entities"][number], keyof EntityReference>]: never; })[] & { [K_6 in Exclude<keyof I_1["entities"], keyof {
            entityId?: string | undefined;
            entryPoints?: string[] | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_7 in Exclude<keyof I_1, keyof Account_AppVoter>]: never; }>(object: I_1): Account_AppVoter;
};
interface Account_WebEntity {
    /** Random anonymized id for analytics */
    webAnalyticsID: string;
}
declare const Account_WebEntity: {
    encode(message: Account_WebEntity, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Account_WebEntity;
    fromJSON(object: any): Account_WebEntity;
    toJSON(message: Account_WebEntity): unknown;
    create<I extends {
        webAnalyticsID?: string | undefined;
    } & {
        webAnalyticsID?: string | undefined;
    } & { [K in Exclude<keyof I, "webAnalyticsID">]: never; }>(base?: I | undefined): Account_WebEntity;
    fromPartial<I_1 extends {
        webAnalyticsID?: string | undefined;
    } & {
        webAnalyticsID?: string | undefined;
    } & { [K_1 in Exclude<keyof I_1, "webAnalyticsID">]: never; }>(object: I_1): Account_WebEntity;
};
interface Account_Extra {
    content?: {
        $case: "appVoter";
        appVoter: Account_AppVoter;
    } | {
        $case: "webEntity";
        webEntity: Account_WebEntity;
    } | undefined;
}
declare const Account_Extra: {
    encode(message: Account_Extra, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Account_Extra;
    fromJSON(object: any): Account_Extra;
    toJSON(message: Account_Extra): unknown;
    create<I extends {
        content?: ({
            appVoter?: {
                appAnalyticsID?: string | undefined;
                entities?: {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "appVoter";
        }) | ({
            webEntity?: {
                webAnalyticsID?: string | undefined;
            } | undefined;
        } & {
            $case: "webEntity";
        }) | undefined;
    } & {
        content?: ({
            appVoter?: {
                appAnalyticsID?: string | undefined;
                entities?: {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "appVoter";
        } & {
            appVoter?: ({
                appAnalyticsID?: string | undefined;
                entities?: {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] | undefined;
            } & {
                appAnalyticsID?: string | undefined;
                entities?: ({
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] & ({
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                } & {
                    entityId?: string | undefined;
                    entryPoints?: (string[] & string[] & { [K in Exclude<keyof I["content"]["appVoter"]["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
                } & { [K_1 in Exclude<keyof I["content"]["appVoter"]["entities"][number], keyof EntityReference>]: never; })[] & { [K_2 in Exclude<keyof I["content"]["appVoter"]["entities"], keyof {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_3 in Exclude<keyof I["content"]["appVoter"], keyof Account_AppVoter>]: never; }) | undefined;
            $case: "appVoter";
        } & { [K_4 in Exclude<keyof I["content"], "$case" | "appVoter">]: never; }) | ({
            webEntity?: {
                webAnalyticsID?: string | undefined;
            } | undefined;
        } & {
            $case: "webEntity";
        } & {
            webEntity?: ({
                webAnalyticsID?: string | undefined;
            } & {
                webAnalyticsID?: string | undefined;
            } & { [K_5 in Exclude<keyof I["content"]["webEntity"], "webAnalyticsID">]: never; }) | undefined;
            $case: "webEntity";
        } & { [K_6 in Exclude<keyof I["content"], "$case" | "webEntity">]: never; }) | undefined;
    } & { [K_7 in Exclude<keyof I, "content">]: never; }>(base?: I | undefined): Account_Extra;
    fromPartial<I_1 extends {
        content?: ({
            appVoter?: {
                appAnalyticsID?: string | undefined;
                entities?: {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "appVoter";
        }) | ({
            webEntity?: {
                webAnalyticsID?: string | undefined;
            } | undefined;
        } & {
            $case: "webEntity";
        }) | undefined;
    } & {
        content?: ({
            appVoter?: {
                appAnalyticsID?: string | undefined;
                entities?: {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "appVoter";
        } & {
            appVoter?: ({
                appAnalyticsID?: string | undefined;
                entities?: {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] | undefined;
            } & {
                appAnalyticsID?: string | undefined;
                entities?: ({
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[] & ({
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                } & {
                    entityId?: string | undefined;
                    entryPoints?: (string[] & string[] & { [K_8 in Exclude<keyof I_1["content"]["appVoter"]["entities"][number]["entryPoints"], keyof string[]>]: never; }) | undefined;
                } & { [K_9 in Exclude<keyof I_1["content"]["appVoter"]["entities"][number], keyof EntityReference>]: never; })[] & { [K_10 in Exclude<keyof I_1["content"]["appVoter"]["entities"], keyof {
                    entityId?: string | undefined;
                    entryPoints?: string[] | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_11 in Exclude<keyof I_1["content"]["appVoter"], keyof Account_AppVoter>]: never; }) | undefined;
            $case: "appVoter";
        } & { [K_12 in Exclude<keyof I_1["content"], "$case" | "appVoter">]: never; }) | ({
            webEntity?: {
                webAnalyticsID?: string | undefined;
            } | undefined;
        } & {
            $case: "webEntity";
        } & {
            webEntity?: ({
                webAnalyticsID?: string | undefined;
            } & {
                webAnalyticsID?: string | undefined;
            } & { [K_13 in Exclude<keyof I_1["content"]["webEntity"], "webAnalyticsID">]: never; }) | undefined;
            $case: "webEntity";
        } & { [K_14 in Exclude<keyof I_1["content"], "$case" | "webEntity">]: never; }) | undefined;
    } & { [K_15 in Exclude<keyof I_1, "content">]: never; }>(object: I_1): Account_Extra;
};
interface Account_MetaEntry {
    key: string;
    value: string;
}
declare const Account_MetaEntry: {
    encode(message: Account_MetaEntry, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Account_MetaEntry;
    fromJSON(object: any): Account_MetaEntry;
    toJSON(message: Account_MetaEntry): unknown;
    create<I extends {
        key?: string | undefined;
        value?: string | undefined;
    } & {
        key?: string | undefined;
        value?: string | undefined;
    } & { [K in Exclude<keyof I, keyof Account_MetaEntry>]: never; }>(base?: I | undefined): Account_MetaEntry;
    fromPartial<I_1 extends {
        key?: string | undefined;
        value?: string | undefined;
    } & {
        key?: string | undefined;
        value?: string | undefined;
    } & { [K_1 in Exclude<keyof I_1, keyof Account_MetaEntry>]: never; }>(object: I_1): Account_MetaEntry;
};

declare const account_Account: typeof Account;
declare const account_Account_AppVoter: typeof Account_AppVoter;
declare const account_Account_Extra: typeof Account_Extra;
declare const account_Account_MetaEntry: typeof Account_MetaEntry;
declare const account_Account_WebEntity: typeof Account_WebEntity;
declare const account_AccountsStore: typeof AccountsStore;
declare namespace account {
  export {
    account_Account as Account,
    account_Account_AppVoter as Account_AppVoter,
    account_Account_Extra as Account_Extra,
    account_Account_MetaEntry as Account_MetaEntry,
    account_Account_WebEntity as Account_WebEntity,
    account_AccountsStore as AccountsStore,
  };
}

declare enum WalletBackup_Recovery_QuestionEnum {
    /** FAVORITE_BOOK - What is your favorite book? */
    FAVORITE_BOOK = 0,
    /** FIRST_PET - What was the name of your first pet? */
    FIRST_PET = 1,
    /** WHERE_HIGH_SCHOOL_COLLEGE - Where did you go to high school/college? */
    WHERE_HIGH_SCHOOL_COLLEGE = 2,
    /** CITY_OF_BIRTH - What city were you born in? */
    CITY_OF_BIRTH = 3,
    /** FAVORITE_CHILDHOOD_FRIEND - What is the name of your favorite childhood friend? */
    FAVORITE_CHILDHOOD_FRIEND = 4,
    /** WHERE_FATHER_AND_MOTHER_MET - Where did your mother and father meet? */
    WHERE_FATHER_AND_MOTHER_MET = 5,
    /** FAVORITE_MOVIE - What is your favorite movie? */
    FAVORITE_MOVIE = 6,
    /** FAVORITE_SPORT_HIGH_SCHOOL - What was your favorite sport in high school? */
    FAVORITE_SPORT_HIGH_SCHOOL = 7,
    /** FAVORITE_TEACHER_HIGH_SCHOOL - What was your favorite teacher in high school? */
    FAVORITE_TEACHER_HIGH_SCHOOL = 8,
    /** FAVORITE_BAND - What is your favorite band? */
    FAVORITE_BAND = 9,
    /** CHILDHOOD_SPORTS_HERO - Who is your childhood sports hero? */
    CHILDHOOD_SPORTS_HERO = 10,
    /** COMPANY_FIRST_JOB - What is the name of the company where you had your first job? */
    COMPANY_FIRST_JOB = 11,
    /** CHILD_NICKNAME - What was your nickname as a child? */
    CHILD_NICKNAME = 12,
    /** NAME_FIRST_PARTNER - What is the name of your first girlfriend or boyfriend? */
    NAME_FIRST_PARTNER = 13,
    /** WHERE_MEET_PARTNER - Where did you meet your partner? */
    WHERE_MEET_PARTNER = 14,
    /** MOTHER_MAIDEN_NAME - What is your mother's maiden name? */
    MOTHER_MAIDEN_NAME = 15,
    /** MATERNAL_GRANDMOTHER_FULL_NAME - What is your maternal grandmother's full name? */
    MATERNAL_GRANDMOTHER_FULL_NAME = 16,
    /** PARENTAL_GRANDMOTHER_FULL_NAME - What is your paternal grandmother's full name? */
    PARENTAL_GRANDMOTHER_FULL_NAME = 17,
    /** NAME_OLDEST_COUSIN - What is the name of your oldest cousin? */
    NAME_OLDEST_COUSIN = 18,
    UNRECOGNIZED = -1
}
declare function walletBackup_Recovery_QuestionEnumFromJSON(object: any): WalletBackup_Recovery_QuestionEnum;
declare function walletBackup_Recovery_QuestionEnumToJSON(object: WalletBackup_Recovery_QuestionEnum): string;
interface WalletBackup {
    /** / A name to help identify the wallet backed up */
    name: string;
    /** / When it was exported. Unix timestamp (seconds) */
    timestamp: number;
    /**
     * / Data to import the wallet, given the original passphrase or pin
     * / Contains the encrypted mnemonic
     */
    wallet: Wallet | undefined;
    passphraseRecovery: WalletBackup_Recovery | undefined;
}
declare const WalletBackup: {
    encode(message: WalletBackup, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WalletBackup;
    fromJSON(object: any): WalletBackup;
    toJSON(message: WalletBackup): unknown;
    create<I extends {
        name?: string | undefined;
        timestamp?: number | undefined;
        wallet?: {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } | undefined;
        passphraseRecovery?: {
            questionIds?: WalletBackup_Recovery_QuestionEnum[] | undefined;
            encryptedPassphrase?: Uint8Array | undefined;
        } | undefined;
    } & {
        name?: string | undefined;
        timestamp?: number | undefined;
        wallet?: ({
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & { [K in Exclude<keyof I["wallet"], keyof Wallet>]: never; }) | undefined;
        passphraseRecovery?: ({
            questionIds?: WalletBackup_Recovery_QuestionEnum[] | undefined;
            encryptedPassphrase?: Uint8Array | undefined;
        } & {
            questionIds?: (WalletBackup_Recovery_QuestionEnum[] & WalletBackup_Recovery_QuestionEnum[] & { [K_1 in Exclude<keyof I["passphraseRecovery"]["questionIds"], keyof WalletBackup_Recovery_QuestionEnum[]>]: never; }) | undefined;
            encryptedPassphrase?: Uint8Array | undefined;
        } & { [K_2 in Exclude<keyof I["passphraseRecovery"], keyof WalletBackup_Recovery>]: never; }) | undefined;
    } & { [K_3 in Exclude<keyof I, keyof WalletBackup>]: never; }>(base?: I | undefined): WalletBackup;
    fromPartial<I_1 extends {
        name?: string | undefined;
        timestamp?: number | undefined;
        wallet?: {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } | undefined;
        passphraseRecovery?: {
            questionIds?: WalletBackup_Recovery_QuestionEnum[] | undefined;
            encryptedPassphrase?: Uint8Array | undefined;
        } | undefined;
    } & {
        name?: string | undefined;
        timestamp?: number | undefined;
        wallet?: ({
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & {
            encryptedMnemonic?: Uint8Array | undefined;
            hdPath?: string | undefined;
            locale?: string | undefined;
            authMethod?: Wallet_AuthMethod | undefined;
        } & { [K_4 in Exclude<keyof I_1["wallet"], keyof Wallet>]: never; }) | undefined;
        passphraseRecovery?: ({
            questionIds?: WalletBackup_Recovery_QuestionEnum[] | undefined;
            encryptedPassphrase?: Uint8Array | undefined;
        } & {
            questionIds?: (WalletBackup_Recovery_QuestionEnum[] & WalletBackup_Recovery_QuestionEnum[] & { [K_5 in Exclude<keyof I_1["passphraseRecovery"]["questionIds"], keyof WalletBackup_Recovery_QuestionEnum[]>]: never; }) | undefined;
            encryptedPassphrase?: Uint8Array | undefined;
        } & { [K_6 in Exclude<keyof I_1["passphraseRecovery"], keyof WalletBackup_Recovery>]: never; }) | undefined;
    } & { [K_7 in Exclude<keyof I_1, keyof WalletBackup>]: never; }>(object: I_1): WalletBackup;
};
/** / Data to recover the original passphrase, given some recovery questions */
interface WalletBackup_Recovery {
    /** / The indexes of the questions used */
    questionIds: WalletBackup_Recovery_QuestionEnum[];
    encryptedPassphrase: Uint8Array;
}
declare const WalletBackup_Recovery: {
    encode(message: WalletBackup_Recovery, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WalletBackup_Recovery;
    fromJSON(object: any): WalletBackup_Recovery;
    toJSON(message: WalletBackup_Recovery): unknown;
    create<I extends {
        questionIds?: WalletBackup_Recovery_QuestionEnum[] | undefined;
        encryptedPassphrase?: Uint8Array | undefined;
    } & {
        questionIds?: (WalletBackup_Recovery_QuestionEnum[] & WalletBackup_Recovery_QuestionEnum[] & { [K in Exclude<keyof I["questionIds"], keyof WalletBackup_Recovery_QuestionEnum[]>]: never; }) | undefined;
        encryptedPassphrase?: Uint8Array | undefined;
    } & { [K_1 in Exclude<keyof I, keyof WalletBackup_Recovery>]: never; }>(base?: I | undefined): WalletBackup_Recovery;
    fromPartial<I_1 extends {
        questionIds?: WalletBackup_Recovery_QuestionEnum[] | undefined;
        encryptedPassphrase?: Uint8Array | undefined;
    } & {
        questionIds?: (WalletBackup_Recovery_QuestionEnum[] & WalletBackup_Recovery_QuestionEnum[] & { [K_2 in Exclude<keyof I_1["questionIds"], keyof WalletBackup_Recovery_QuestionEnum[]>]: never; }) | undefined;
        encryptedPassphrase?: Uint8Array | undefined;
    } & { [K_3 in Exclude<keyof I_1, keyof WalletBackup_Recovery>]: never; }>(object: I_1): WalletBackup_Recovery;
};

declare const backup_WalletBackup: typeof WalletBackup;
declare const backup_WalletBackup_Recovery: typeof WalletBackup_Recovery;
type backup_WalletBackup_Recovery_QuestionEnum = WalletBackup_Recovery_QuestionEnum;
declare const backup_WalletBackup_Recovery_QuestionEnum: typeof WalletBackup_Recovery_QuestionEnum;
declare const backup_walletBackup_Recovery_QuestionEnumFromJSON: typeof walletBackup_Recovery_QuestionEnumFromJSON;
declare const backup_walletBackup_Recovery_QuestionEnumToJSON: typeof walletBackup_Recovery_QuestionEnumToJSON;
declare namespace backup {
  export {
    backup_WalletBackup as WalletBackup,
    backup_WalletBackup_Recovery as WalletBackup_Recovery,
    backup_WalletBackup_Recovery_QuestionEnum as WalletBackup_Recovery_QuestionEnum,
    backup_walletBackup_Recovery_QuestionEnumFromJSON as walletBackup_Recovery_QuestionEnumFromJSON,
    backup_walletBackup_Recovery_QuestionEnumToJSON as walletBackup_Recovery_QuestionEnumToJSON,
  };
}

/** Implementing the data structure from https://vocdoni.io/docs/#/architecture/components/bootnode */
interface BootNodeGateways {
    /** network Id's */
    homestead: BootNodeGateways_NetworkNodes | undefined;
    goerli: BootNodeGateways_NetworkNodes | undefined;
    xdai: BootNodeGateways_NetworkNodes | undefined;
    sokol: BootNodeGateways_NetworkNodes | undefined;
    rinkeby: BootNodeGateways_NetworkNodes | undefined;
    /**
     * EXTERNAL FIELDS
     * Allow to use arbitrary key/values so that
     * gateways can be organized by custom values.
     */
    meta: {
        [key: string]: string;
    };
}
declare const BootNodeGateways: {
    encode(message: BootNodeGateways, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BootNodeGateways;
    fromJSON(object: any): BootNodeGateways;
    toJSON(message: BootNodeGateways): unknown;
    create<I extends {
        homestead?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        goerli?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        xdai?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        sokol?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        rinkeby?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        meta?: {
            [x: string]: string | undefined;
        } | undefined;
    } & {
        homestead?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K in Exclude<keyof I["homestead"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_1 in Exclude<keyof I["homestead"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_2 in Exclude<keyof I["homestead"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_3 in Exclude<keyof I["homestead"]["web3"][number], "uri">]: never; })[] & { [K_4 in Exclude<keyof I["homestead"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_5 in Exclude<keyof I["homestead"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        goerli?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_6 in Exclude<keyof I["goerli"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_7 in Exclude<keyof I["goerli"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_8 in Exclude<keyof I["goerli"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_9 in Exclude<keyof I["goerli"]["web3"][number], "uri">]: never; })[] & { [K_10 in Exclude<keyof I["goerli"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_11 in Exclude<keyof I["goerli"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        xdai?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_12 in Exclude<keyof I["xdai"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_13 in Exclude<keyof I["xdai"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_14 in Exclude<keyof I["xdai"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_15 in Exclude<keyof I["xdai"]["web3"][number], "uri">]: never; })[] & { [K_16 in Exclude<keyof I["xdai"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_17 in Exclude<keyof I["xdai"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        sokol?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_18 in Exclude<keyof I["sokol"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_19 in Exclude<keyof I["sokol"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_20 in Exclude<keyof I["sokol"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_21 in Exclude<keyof I["sokol"]["web3"][number], "uri">]: never; })[] & { [K_22 in Exclude<keyof I["sokol"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_23 in Exclude<keyof I["sokol"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        rinkeby?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_24 in Exclude<keyof I["rinkeby"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_25 in Exclude<keyof I["rinkeby"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_26 in Exclude<keyof I["rinkeby"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_27 in Exclude<keyof I["rinkeby"]["web3"][number], "uri">]: never; })[] & { [K_28 in Exclude<keyof I["rinkeby"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_29 in Exclude<keyof I["rinkeby"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        meta?: ({
            [x: string]: string | undefined;
        } & {
            [x: string]: string | undefined;
        } & { [K_30 in Exclude<keyof I["meta"], string | number>]: never; }) | undefined;
    } & { [K_31 in Exclude<keyof I, keyof BootNodeGateways>]: never; }>(base?: I | undefined): BootNodeGateways;
    fromPartial<I_1 extends {
        homestead?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        goerli?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        xdai?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        sokol?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        rinkeby?: {
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } | undefined;
        meta?: {
            [x: string]: string | undefined;
        } | undefined;
    } & {
        homestead?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_32 in Exclude<keyof I_1["homestead"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_33 in Exclude<keyof I_1["homestead"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_34 in Exclude<keyof I_1["homestead"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_35 in Exclude<keyof I_1["homestead"]["web3"][number], "uri">]: never; })[] & { [K_36 in Exclude<keyof I_1["homestead"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_37 in Exclude<keyof I_1["homestead"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        goerli?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_38 in Exclude<keyof I_1["goerli"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_39 in Exclude<keyof I_1["goerli"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_40 in Exclude<keyof I_1["goerli"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_41 in Exclude<keyof I_1["goerli"]["web3"][number], "uri">]: never; })[] & { [K_42 in Exclude<keyof I_1["goerli"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_43 in Exclude<keyof I_1["goerli"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        xdai?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_44 in Exclude<keyof I_1["xdai"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_45 in Exclude<keyof I_1["xdai"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_46 in Exclude<keyof I_1["xdai"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_47 in Exclude<keyof I_1["xdai"]["web3"][number], "uri">]: never; })[] & { [K_48 in Exclude<keyof I_1["xdai"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_49 in Exclude<keyof I_1["xdai"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        sokol?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_50 in Exclude<keyof I_1["sokol"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_51 in Exclude<keyof I_1["sokol"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_52 in Exclude<keyof I_1["sokol"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_53 in Exclude<keyof I_1["sokol"]["web3"][number], "uri">]: never; })[] & { [K_54 in Exclude<keyof I_1["sokol"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_55 in Exclude<keyof I_1["sokol"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        rinkeby?: ({
            dvote?: {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] | undefined;
            web3?: {
                uri?: string | undefined;
            }[] | undefined;
        } & {
            dvote?: ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[] & ({
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            } & {
                uri?: string | undefined;
                apis?: (string[] & string[] & { [K_56 in Exclude<keyof I_1["rinkeby"]["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
                pubKey?: string | undefined;
            } & { [K_57 in Exclude<keyof I_1["rinkeby"]["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_58 in Exclude<keyof I_1["rinkeby"]["dvote"], keyof {
                uri?: string | undefined;
                apis?: string[] | undefined;
                pubKey?: string | undefined;
            }[]>]: never; }) | undefined;
            web3?: ({
                uri?: string | undefined;
            }[] & ({
                uri?: string | undefined;
            } & {
                uri?: string | undefined;
            } & { [K_59 in Exclude<keyof I_1["rinkeby"]["web3"][number], "uri">]: never; })[] & { [K_60 in Exclude<keyof I_1["rinkeby"]["web3"], keyof {
                uri?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_61 in Exclude<keyof I_1["rinkeby"], keyof BootNodeGateways_NetworkNodes>]: never; }) | undefined;
        meta?: ({
            [x: string]: string | undefined;
        } & {
            [x: string]: string | undefined;
        } & { [K_62 in Exclude<keyof I_1["meta"], string | number>]: never; }) | undefined;
    } & { [K_63 in Exclude<keyof I_1, keyof BootNodeGateways>]: never; }>(object: I_1): BootNodeGateways;
};
interface BootNodeGateways_NetworkNodes {
    dvote: BootNodeGateways_NetworkNodes_DVote[];
    web3: BootNodeGateways_NetworkNodes_Web3[];
}
declare const BootNodeGateways_NetworkNodes: {
    encode(message: BootNodeGateways_NetworkNodes, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BootNodeGateways_NetworkNodes;
    fromJSON(object: any): BootNodeGateways_NetworkNodes;
    toJSON(message: BootNodeGateways_NetworkNodes): unknown;
    create<I extends {
        dvote?: {
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        }[] | undefined;
        web3?: {
            uri?: string | undefined;
        }[] | undefined;
    } & {
        dvote?: ({
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        }[] & ({
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        } & {
            uri?: string | undefined;
            apis?: (string[] & string[] & { [K in Exclude<keyof I["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
            pubKey?: string | undefined;
        } & { [K_1 in Exclude<keyof I["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_2 in Exclude<keyof I["dvote"], keyof {
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        }[]>]: never; }) | undefined;
        web3?: ({
            uri?: string | undefined;
        }[] & ({
            uri?: string | undefined;
        } & {
            uri?: string | undefined;
        } & { [K_3 in Exclude<keyof I["web3"][number], "uri">]: never; })[] & { [K_4 in Exclude<keyof I["web3"], keyof {
            uri?: string | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_5 in Exclude<keyof I, keyof BootNodeGateways_NetworkNodes>]: never; }>(base?: I | undefined): BootNodeGateways_NetworkNodes;
    fromPartial<I_1 extends {
        dvote?: {
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        }[] | undefined;
        web3?: {
            uri?: string | undefined;
        }[] | undefined;
    } & {
        dvote?: ({
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        }[] & ({
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        } & {
            uri?: string | undefined;
            apis?: (string[] & string[] & { [K_6 in Exclude<keyof I_1["dvote"][number]["apis"], keyof string[]>]: never; }) | undefined;
            pubKey?: string | undefined;
        } & { [K_7 in Exclude<keyof I_1["dvote"][number], keyof BootNodeGateways_NetworkNodes_DVote>]: never; })[] & { [K_8 in Exclude<keyof I_1["dvote"], keyof {
            uri?: string | undefined;
            apis?: string[] | undefined;
            pubKey?: string | undefined;
        }[]>]: never; }) | undefined;
        web3?: ({
            uri?: string | undefined;
        }[] & ({
            uri?: string | undefined;
        } & {
            uri?: string | undefined;
        } & { [K_9 in Exclude<keyof I_1["web3"][number], "uri">]: never; })[] & { [K_10 in Exclude<keyof I_1["web3"], keyof {
            uri?: string | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_11 in Exclude<keyof I_1, keyof BootNodeGateways_NetworkNodes>]: never; }>(object: I_1): BootNodeGateways_NetworkNodes;
};
interface BootNodeGateways_NetworkNodes_DVote {
    uri: string;
    apis: string[];
    pubKey: string;
}
declare const BootNodeGateways_NetworkNodes_DVote: {
    encode(message: BootNodeGateways_NetworkNodes_DVote, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BootNodeGateways_NetworkNodes_DVote;
    fromJSON(object: any): BootNodeGateways_NetworkNodes_DVote;
    toJSON(message: BootNodeGateways_NetworkNodes_DVote): unknown;
    create<I extends {
        uri?: string | undefined;
        apis?: string[] | undefined;
        pubKey?: string | undefined;
    } & {
        uri?: string | undefined;
        apis?: (string[] & string[] & { [K in Exclude<keyof I["apis"], keyof string[]>]: never; }) | undefined;
        pubKey?: string | undefined;
    } & { [K_1 in Exclude<keyof I, keyof BootNodeGateways_NetworkNodes_DVote>]: never; }>(base?: I | undefined): BootNodeGateways_NetworkNodes_DVote;
    fromPartial<I_1 extends {
        uri?: string | undefined;
        apis?: string[] | undefined;
        pubKey?: string | undefined;
    } & {
        uri?: string | undefined;
        apis?: (string[] & string[] & { [K_2 in Exclude<keyof I_1["apis"], keyof string[]>]: never; }) | undefined;
        pubKey?: string | undefined;
    } & { [K_3 in Exclude<keyof I_1, keyof BootNodeGateways_NetworkNodes_DVote>]: never; }>(object: I_1): BootNodeGateways_NetworkNodes_DVote;
};
interface BootNodeGateways_NetworkNodes_Web3 {
    uri: string;
}
declare const BootNodeGateways_NetworkNodes_Web3: {
    encode(message: BootNodeGateways_NetworkNodes_Web3, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BootNodeGateways_NetworkNodes_Web3;
    fromJSON(object: any): BootNodeGateways_NetworkNodes_Web3;
    toJSON(message: BootNodeGateways_NetworkNodes_Web3): unknown;
    create<I extends {
        uri?: string | undefined;
    } & {
        uri?: string | undefined;
    } & { [K in Exclude<keyof I, "uri">]: never; }>(base?: I | undefined): BootNodeGateways_NetworkNodes_Web3;
    fromPartial<I_1 extends {
        uri?: string | undefined;
    } & {
        uri?: string | undefined;
    } & { [K_1 in Exclude<keyof I_1, "uri">]: never; }>(object: I_1): BootNodeGateways_NetworkNodes_Web3;
};
interface BootNodeGateways_MetaEntry {
    key: string;
    value: string;
}
declare const BootNodeGateways_MetaEntry: {
    encode(message: BootNodeGateways_MetaEntry, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BootNodeGateways_MetaEntry;
    fromJSON(object: any): BootNodeGateways_MetaEntry;
    toJSON(message: BootNodeGateways_MetaEntry): unknown;
    create<I extends {
        key?: string | undefined;
        value?: string | undefined;
    } & {
        key?: string | undefined;
        value?: string | undefined;
    } & { [K in Exclude<keyof I, keyof BootNodeGateways_MetaEntry>]: never; }>(base?: I | undefined): BootNodeGateways_MetaEntry;
    fromPartial<I_1 extends {
        key?: string | undefined;
        value?: string | undefined;
    } & {
        key?: string | undefined;
        value?: string | undefined;
    } & { [K_1 in Exclude<keyof I_1, keyof BootNodeGateways_MetaEntry>]: never; }>(object: I_1): BootNodeGateways_MetaEntry;
};

declare const gateway_BootNodeGateways: typeof BootNodeGateways;
declare const gateway_BootNodeGateways_MetaEntry: typeof BootNodeGateways_MetaEntry;
declare const gateway_BootNodeGateways_NetworkNodes: typeof BootNodeGateways_NetworkNodes;
declare const gateway_BootNodeGateways_NetworkNodes_DVote: typeof BootNodeGateways_NetworkNodes_DVote;
declare const gateway_BootNodeGateways_NetworkNodes_Web3: typeof BootNodeGateways_NetworkNodes_Web3;
declare namespace gateway {
  export {
    gateway_BootNodeGateways as BootNodeGateways,
    gateway_BootNodeGateways_MetaEntry as BootNodeGateways_MetaEntry,
    gateway_BootNodeGateways_NetworkNodes as BootNodeGateways_NetworkNodes,
    gateway_BootNodeGateways_NetworkNodes_DVote as BootNodeGateways_NetworkNodes_DVote,
    gateway_BootNodeGateways_NetworkNodes_Web3 as BootNodeGateways_NetworkNodes_Web3,
  };
}

declare namespace index {
  export {
    account as Account,
    backup as Backup,
    gateway as Gateway,
    wallet as Wallet,
  };
}

export { account as a, backup as b, gateway as g, index as i, wallet as w };
