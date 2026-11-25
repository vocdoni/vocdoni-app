// The device's saved choice (System, Light or Dark), written by the dashboard's Appearance control.
export const COLOR_MODE_STORAGE_KEY = 'theme-preference'
// Voter pages read this key, which nothing writes, so they always follow the system and never a stored choice.
export const VOTER_COLOR_MODE_STORAGE_KEY = 'theme-preference-voter'

// The public SSR pages (a vote, its summary, an organisation, the home process) and the error page, which renders
// the public shell, are voter pages: the shell follows the system after hydration, so the first paint must too.
export const isVoterPageId = (pageId: string | null | undefined): boolean =>
  !!pageId && /\/(processes|organization)\/|\/home-process$|\/_error$/.test(pageId)

// Sets the colour mode on <html> before first paint, as next-themes does with attribute='class': the client-rendered
// routes never run next-themes' own script, so without this the shell paints light before the bundle loads.
export const colorModeScript = (followSystem: boolean): string => {
  const key = followSystem ? VOTER_COLOR_MODE_STORAGE_KEY : COLOR_MODE_STORAGE_KEY
  return `<script>(function(){try{var t=localStorage.getItem('${key}');if(t!=='light'&&t!=='dark')t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(t);e.style.colorScheme=t}catch(e){}})()</script>`
}
