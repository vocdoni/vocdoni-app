// src/cookies/index.ts
import { Cookie } from "tough-cookie";
function getCookie(request, name) {
  const cookies = getCookies(request);
  return cookies.find((c) => c.key === name);
}
function getCookies(request) {
  const cookies = request.headers.get("Cookie");
  return cookies?.split(";").map((x) => Cookie.parse(x)).filter((x) => x !== void 0) ?? [];
}
function setCookie(response, name, value, options) {
  deleteCookie(response, name);
  response.headers.append(
    "Set-Cookie",
    new Cookie({
      ...options,
      key: name,
      value
    }).toString()
  );
}
function deleteCookie(response, name) {
  const cookies = response.headers.getSetCookie();
  response.headers.delete("Set-Cookie");
  for (const cookie of cookies) {
    const c = Cookie.parse(cookie);
    if (c && c.key !== name) {
      response.headers.append("Set-Cookie", cookie);
    }
  }
}
export {
  deleteCookie,
  getCookie,
  getCookies,
  setCookie
};
