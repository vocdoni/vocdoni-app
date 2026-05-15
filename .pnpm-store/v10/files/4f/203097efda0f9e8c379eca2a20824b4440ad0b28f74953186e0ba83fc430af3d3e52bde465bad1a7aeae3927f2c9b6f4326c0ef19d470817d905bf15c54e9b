export { onRenderHtml };
import { renderToStream } from 'react-streaming/server';
import { escapeInject } from 'vike/server';
import type { PageContextServer } from 'vike/types';
import type { PageContextInternal } from '../types/PageContext.js';
declare function onRenderHtml(pageContext: PageContextServer & PageContextInternal): Promise<ReturnType<typeof escapeInject>>;
export type PageHtmlStream = Awaited<ReturnType<typeof renderToStream>>;
export type Viewport = 'responsive' | number | null;
export type HtmlInjection = string | ((pageContext: PageContextServer) => string);
