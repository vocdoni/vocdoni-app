export { config as default };
import { ssrEffect } from './integration/ssrEffect.js';
declare const config: {
    name: string;
    require: {
        vike: string;
    };
    Loading: "import:vike-react/__internal/integration/Loading:default";
    onRenderHtml: "import:vike-react/__internal/integration/onRenderHtml:onRenderHtml";
    onRenderClient: "import:vike-react/__internal/integration/onRenderClient:onRenderClient";
    passToClient: string[];
    clientRouting: true;
    hydrationCanBeAborted: true;
    staticReplace: ({
        env: "server";
        filter: string;
        type: "call";
        match: {
            function: string[];
            args: {
                0: string;
            };
        };
        remove: {
            arg: number;
            prop: string;
            argsFrom?: undefined;
        };
        replace?: undefined;
    } | {
        env: "server";
        filter: string;
        type: "call";
        match: {
            function: string;
            args: {
                0: string;
            };
        };
        remove: {
            argsFrom: number;
            arg?: undefined;
            prop?: undefined;
        };
        replace?: undefined;
    } | {
        env: "server";
        filter: string;
        type: "call";
        match: {
            function: string;
            args?: undefined;
        };
        replace: {
            with: boolean;
        };
        remove?: undefined;
    })[];
    meta: {
        Head: {
            env: {
                server: true;
            };
            cumulative: true;
        };
        Layout: {
            env: {
                server: true;
                client: true;
            };
            cumulative: true;
        };
        title: {
            env: {
                server: true;
                client: true;
            };
        };
        description: {
            env: {
                server: true;
            };
        };
        image: {
            env: {
                server: true;
            };
        };
        viewport: {
            env: {
                server: true;
            };
        };
        favicon: {
            env: {
                server: true;
            };
            global: true;
        };
        lang: {
            env: {
                server: true;
                client: true;
            };
        };
        bodyHtmlBegin: {
            env: {
                server: true;
            };
            cumulative: true;
            global: true;
        };
        bodyHtmlEnd: {
            env: {
                server: true;
            };
            cumulative: true;
            global: true;
        };
        headHtmlBegin: {
            env: {
                server: true;
            };
            cumulative: true;
            global: true;
        };
        headHtmlEnd: {
            env: {
                server: true;
            };
            cumulative: true;
            global: true;
        };
        htmlAttributes: {
            env: {
                server: true;
            };
            global: true;
            cumulative: true;
        };
        bodyAttributes: {
            env: {
                server: true;
            };
            global: true;
            cumulative: true;
        };
        ssr: {
            env: {
                config: true;
            };
            effect: typeof ssrEffect;
        };
        stream: {
            env: {
                server: true;
            };
            cumulative: true;
        };
        streamIsRequired: {
            env: {
                server: true;
            };
        };
        onBeforeRenderHtml: {
            env: {
                server: true;
            };
            cumulative: true;
        };
        onAfterRenderHtml: {
            env: {
                server: true;
            };
            cumulative: true;
        };
        onBeforeRenderClient: {
            env: {
                client: true;
            };
            cumulative: true;
        };
        onAfterRenderClient: {
            env: {
                client: true;
            };
            cumulative: true;
        };
        Wrapper: {
            cumulative: true;
            env: {
                client: true;
                server: true;
            };
        };
        reactStrictMode: {
            env: {
                client: true;
                server: true;
            };
        };
        Loading: {
            env: {
                server: true;
                client: true;
            };
        };
        react: {
            cumulative: true;
            env: {};
        };
    };
};
import './types/Config.js';
import './types/PageContext.js';
