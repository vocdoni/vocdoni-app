# isbot-fast &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mahovich/isbot-fast/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/isbot-fast.svg?style=flat)](https://www.npmjs.com/package/isbot-fast)

The `isbot-fast` package is needed to quickly identify most bots/crawlers/spiders using a user-agent. It runs more than 10 times faster than the `isbot` package.

In addition to the search bots, `isbot-fast` identifies:
* bots of social networks and instant messengers
* preview bots receiving meta-information about the page
* some scanners and monitoring
* content downloaders

Note: the purpose of the package is not to determine absolutely all bots, since this will significantly slow down the speed of work. `isbot-fast` probably determines 99.5% of all requests sent by bots at the moment. If you want to identify even more existing bots, then pay attention to the `isbot` package.

The result of the function is a boolean value.

## Installation

```sh
npm install isbot-fast --save
```

## Usage

```js
const isBot = require('isbot-fast');

isBot('Googlebot/2.1 (+http://www.google.com/bot.html)');
// true

isBot('Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14');
// false
```

## Extending

If you want to maintain performance and exclude some bots that bother you, then add these bots to the additional exclusion list as shown in the example below.

```js
const isBot = require('isbot-fast');

isBot('W3C_Validator/1.3');
// false

isBot.extend(['validator', 'image']);

isBot('W3C_Validator/1.3');
// true
```

## Use case

```js
const isBot = require('isbot-fast');
const ua = req.headers['user-agent'] || '';

if (isBot(ua)) {
  // Provide static page for spiders when you have a single page app
} else {
  // Making cookies
}
```

## License

`isbot-fast` is [MIT licensed](https://github.com/mahovich/isbot-fast/blob/master/LICENSE).
