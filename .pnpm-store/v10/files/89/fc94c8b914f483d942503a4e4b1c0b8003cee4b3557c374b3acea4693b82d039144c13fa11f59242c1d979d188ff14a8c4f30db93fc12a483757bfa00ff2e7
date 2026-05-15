import { Cookie, CreateCookieOptions } from 'tough-cookie';

declare function getCookie(request: Request, name: string): Cookie | undefined;
declare function getCookies(request: Request): Cookie[];
declare function setCookie(response: Response, name: string, value: string, options?: Omit<CreateCookieOptions, "key" | "value">): void;
declare function deleteCookie(response: Response, name: string): void;

export { deleteCookie, getCookie, getCookies, setCookie };
