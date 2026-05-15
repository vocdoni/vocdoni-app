import { object, array, string } from 'yup';
import { MultiLanguage, multiLanguageStringKeys } from '../../util/lang';

/**
 * Asserts that the given metadata is valid.
 * Throws an exception if it is not.
 */
export function checkValidAccountMetadata(accountMetadata: AccountMetadata) {
  if (typeof accountMetadata != 'object') throw new Error('The metadata must be a JSON object');

  try {
    accountMetadataSchema.validateSync(accountMetadata);
    return accountMetadataSchema.cast(accountMetadata) as unknown as AccountMetadata;
  } catch (err) {
    if (Array.isArray(err.errors)) throw new Error('ValidationError: ' + err.errors.join(', '));
    throw err;
  }
}

const accountMetadataSchema = object()
  .shape({
    version: string()
      .matches(/^[0-9]\.[0-9]$/)
      .required(),

    languages: array()
      .of(string().matches(/^([a-z]{2}|default)$/))
      .required(), // TODO: remove default
    name: object().shape(multiLanguageStringKeys).optional(),
    description: object().shape(multiLanguageStringKeys).optional(),

    newsFeed: object().shape(multiLanguageStringKeys).optional(),
    media: object().shape({
      avatar: string().optional(),
      header: string().optional(),
      logo: string().optional(),
    }),
    meta: object().optional(),
  })
  .unknown(true); // allow deprecated or unknown fields beyond the required ones

type ProtocolVersion = '1.0';

/**
 * JSON metadata. Intended to be stored on IPFS or similar.
 * More info: https://vocdoni.io/docs/#/architecture/components/entity?id=meta
 */
export interface AccountMetadata {
  version: ProtocolVersion; // Protocol version
  languages: string[];

  name: MultiLanguage<string>;
  description: MultiLanguage<string>;

  newsFeed: MultiLanguage<string>;

  media: {
    avatar: string;
    header: string;
    logo: string;
  };
  meta?: {
    [key: string]: any;
  };
}

export const AccountMetadataTemplate: AccountMetadata = {
  version: '1.0',
  languages: [],
  name: {
    default: '',
  },
  description: {
    default: '',
  },
  newsFeed: {
    default: '',
  },
  media: {
    avatar: '',
    header: '',
    logo: '',
  },
  meta: {},
};
