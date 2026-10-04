import type { TableFix } from '~components/Spreadsheet/readTable'
import type { ColumnTarget } from './autoMatch'

/** A line of the "What we did for you" receipt: only things that actually happened. */
export type ReceiptItem =
  | TableFix
  | { kind: 'matched'; matched: number; total: number; columns: string[] }
  | { kind: 'left_out'; columns: string[] }
  | { kind: 'kept_extra'; columns: string[] }
  | { kind: 'duplicates'; count: number }

type ReceiptInput = {
  header: string[]
  /** What we matched by ourselves */
  autoTargets: ColumnTarget[]
  /** What the admin went with */
  targets: ColumnTarget[]
  fixes: TableFix[]
  /** Rows left out as repeats of others */
  duplicatesLeftOut: number
}

export const buildReceipt = ({
  header,
  autoTargets,
  targets,
  fixes,
  duplicatesLeftOut,
}: ReceiptInput): ReceiptItem[] => {
  const columnsWhere = (test: (target: ColumnTarget, index: number) => boolean) =>
    header.filter((_, index) => test(targets[index], index))
  // Columns we matched that the admin kept as we matched them
  const matched = columnsWhere(
    (target, index) => target === autoTargets[index] && target !== 'skip' && target !== 'extra'
  )
  const items: ReceiptItem[] = []
  if (matched.length) items.push({ kind: 'matched', matched: matched.length, total: header.length, columns: matched })
  items.push(...fixes.filter((fix) => !('count' in fix) || fix.count > 0))
  if (duplicatesLeftOut) items.push({ kind: 'duplicates', count: duplicatesLeftOut })
  const leftOut = columnsWhere((target) => target === 'skip')
  if (leftOut.length) items.push({ kind: 'left_out', columns: leftOut })
  const extra = columnsWhere((target) => target === 'extra')
  if (extra.length) items.push({ kind: 'kept_extra', columns: extra })
  return items
}
