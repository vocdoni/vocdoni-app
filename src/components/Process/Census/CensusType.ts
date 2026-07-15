export const CensusTypeCsp = 'csp'
export type CensusType = typeof CensusTypeCsp

export type CensusMeta = {
  type: CensusType
  fields?: string[]
  salt?: string
}

export enum CensusTypes {
  CSP = CensusTypeCsp,
}
