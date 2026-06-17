import { ShellFocused } from './shells/ShellFocused'
import { ShellTwoPane, ShellProps } from './shells/ShellTwoPane'
import { useEditorVariant } from './variant'

/** Renders the editor layout for the currently selected variant. */
export const EditorShell = (props: ShellProps) => {
  const { variant } = useEditorVariant()

  switch (variant) {
    case 'focused':
      return <ShellFocused {...props} />
    case 'two-pane':
    default:
      return <ShellTwoPane {...props} />
  }
}
