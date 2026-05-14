let bots = [
  // generic
  'bot', // googlebot, bingbot, telegrambot, twitterbot, yandexbot, etc.
  'check',
  'cloud', // cloudflare, cloudinary, etc.
  'crawler',
  'download',
  'monitor', // monitor & monitoring
  'preview', // skypeuripreview, bingpreview, yahoo link preview, etc.
  'scan',
  'spider', // baiduspider, 360spider, screaming frog seo spider, etc.

  // search engines
  'google',
  'qwantify',
  'yahoo',

  // aggregators, messengers and social networks
  'facebookexternalhit',
  'flipboard',
  'tumblr',
  'vkshare',
  'whatsapp',

  // downloaders
  'curl',
  'perl',
  'python',
  'wget',

  // high activity scanners
  'heritrix',
  'ia_archiver',
];
const createRegex = () => new RegExp(`(${bots.join('|')})`, 'i');
let isBotRegex = createRegex();

module.exports = userAgent => isBotRegex.test(userAgent);

module.exports.extend = (additionalBots) => {
  bots = [...new Set(bots.concat(additionalBots))];
  isBotRegex = createRegex();
};
