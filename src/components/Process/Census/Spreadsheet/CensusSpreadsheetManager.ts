// walletFromRow was removed from @vocdoni/react-components v2; derive the wallet via ethers directly
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { Wallet } from '@ethersproject/wallet'
const walletFromRow = (salt: string, data: string[]) => new Wallet(keccak256(toUtf8Bytes([salt, ...data].join(','))))
import { ErrorType, SpreadsheetManager } from '~components/Spreadsheet/SpreadsheetManager'
import ErrorRowLength from './errors/ErrorRowLength'
import ErrorWeightType from './errors/ErrorWeightType'

const WeightColPosition = 1

export class CensusSpreadsheetManager extends SpreadsheetManager {
  public weighted: boolean

  constructor(file: File, headed: boolean = true, weighted: boolean = false) {
    super(file, headed)
    this.weighted = weighted
  }

  public loadFromStorage(manager: string | InstanceType<typeof CensusSpreadsheetManager>) {
    let mi = typeof manager === 'string' ? JSON.parse(manager) : manager

    this.heading = mi.heading
    this.filedata = mi.filedata
    this.file = new File([], mi.file.path)
    this.headed = mi.headed
    this.weighted = mi.weighted
  }

  public validateDataIntegrity(): void {
    const errorTypes: ErrorType[] = []

    super.validateDataIntegrity()

    this.filedata.forEach((row, index) => {
      // actual index
      const ai = this.headed ? index + 2 : index + 1
      // check for different column size
      if (this.heading.length && row.length !== this.heading.length) {
        if (!errorTypes.includes(ErrorType.InvalidRowLength)) {
          errorTypes.push(ErrorType.InvalidRowLength)
        }
        this.errors.push(ai)
      }

      // check weight column
      if (this.weighted) {
        const regex = /^[0-9]+$/
        if (!regex.test(row[WeightColPosition - 1])) {
          if (!errorTypes.includes(ErrorType.InvalidWeight)) {
            errorTypes.push(ErrorType.InvalidWeight)
          }
          this.errors.push(ai)
        }
      }
    })

    // we could return both errors with a custom generic error type (rather than
    // one for each one), but it could bring false-positives, since having an
    // erroneus row length could also trigger the invalid weighted vote
    if (errorTypes.includes(ErrorType.InvalidRowLength)) {
      throw new ErrorRowLength(this.errors)
    }

    if (errorTypes.includes(ErrorType.InvalidWeight)) {
      throw new ErrorWeightType(this.errors)
    }
  }

  public get header(): string[] {
    return !this.weighted ? this.heading : this.heading.slice(WeightColPosition)
  }

  public get data(): string[][] {
    return !this.weighted ? this.filedata : this.filedata.map((row) => row.slice(WeightColPosition))
  }

  public get weights(): string[] {
    return this.weighted ? this.filedata.map((row) => row[WeightColPosition - 1]) : this.filedata.map(() => '1')
  }

  public generateWallets(salt: string): Promise<{ address: string; weight: number | undefined }[]> {
    return Promise.all(
      this.filedata.map(
        (row: string[]): Promise<{ address: string; weight: number | undefined }> =>
          new Promise((resolve, reject) =>
            setTimeout(async () => {
              try {
                const data = this.weighted ? row.slice(WeightColPosition) : row
                const weight = this.weighted ? parseInt(row[WeightColPosition - 1], 10) : undefined
                const wallet = walletFromRow(salt, data)
                const address = await wallet.getAddress()

                resolve({ address, weight })
              } catch (e) {
                reject(e)
              }
            }, 50)
          )
      )
    )
  }
}
