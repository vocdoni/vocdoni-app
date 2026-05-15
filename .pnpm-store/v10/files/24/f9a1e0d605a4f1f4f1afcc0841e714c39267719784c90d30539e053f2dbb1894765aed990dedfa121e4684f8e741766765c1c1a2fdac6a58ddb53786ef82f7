[![Build Status](https://travis-ci.org/pubcore/iso-language-codes.svg?branch=master)](https://travis-ci.org/pubcore/iso-language-codes)

### ISO language codes
see https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

##### Install
		npm i --save iso-language-codes

##### Examples
		import codes, {by639_1, by639_2T, by639_2B} from 'iso-language-codes'
		var code

		code = codes[0]
		//code is
		{ 	
			name: 'Serbian',
  			nativeName: 'српски језик',
  			iso639_1: 'sr',
  			iso639_2T: 'srp',
  			iso639_2B: 'srp'
		}

		code = by639_1['en']
		//code is
		{ 	
			name: 'English',
  			nativeName: 'English',
  			iso639_1: 'en',
  			iso639_2T: 'eng',
  			iso639_2B: 'eng'
		}


		code = iso639_2T['fra']
		//code is
		{
			name: 'French',
  			nativeName: 'français, langue française',
  			iso639_1: 'fr',
  			iso639_2T: 'fra',
  			iso639_2B: 'fre'
		}

		//get an array of all iso639_2B codes:
		var code2BList = Object.keys(iso639_2B)
