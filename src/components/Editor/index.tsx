import { Box, chakra, TextareaProps, useRecipe } from '@chakra-ui/react'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { $convertFromMarkdownString, TRANSFORMERS as DEFAULT_TRANSFORMERS } from '@lexical/markdown'
import { OverflowNode } from '@lexical/overflow'
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { useState } from 'react'

import editor from '~theme/editor'
import { FloatingLinkEditorPlugin, FloatingTextFormatToolbarPlugin } from './plugins'
import MarkdownValuePlugin from './plugins/MarkdownValuePlugin'
import OnChangeMarkdown from './plugins/OnChangeMarkdown'
import PlaceholderPlugin from './plugins/PlaceholderPlugin'
import ReadOnlyPlugin from './plugins/ReadOnlyPlugin'

export type EditorTypographyProp = {
  fontSize: string
  lineHeight: string
  fontWeight: number
  color: string
  placeholderColor: string
}

type EditorProps = {
  isDisabled?: boolean
  maxLength?: number
  onChange?: (value: string) => void
  placeholder?: string
  defaultValue?: string
  value?: string
  variant?: TextareaProps['variant']
  padding?: TextareaProps['padding']
  /** Opt-in: makes typed content and the placeholder share the same metrics
   * (only colour differs). Other Editor usages omit it and are unchanged. */
  typography?: EditorTypographyProp
}

const TRANSFORMERS = DEFAULT_TRANSFORMERS

const ChakraContentEditable = chakra(ContentEditable)

const theme = {
  text: {
    bold: 'lexical-bold',
    italic: 'lexical-italic',
    underline: 'lexical-underline',
    strikethrough: 'lexical-strikethrough',
  },
  list: {
    ul: 'lexical-ul',
    ol: 'lexical-ol',
    listitem: 'lexical-li',
  },
  link: 'lexical-link',
  quote: 'lexical-quote',
  heading: {
    h1: 'lexical-h1',
    h2: 'lexical-h2',
    h3: 'lexical-h3',
    h4: 'lexical-h4',
    h5: 'lexical-h5',
  },
  paragraph: 'lexical-paragraph',
}

const MarkdownEditor = (props: EditorProps) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)
  const isUnstyled = props.variant === ('unstyled' as EditorProps['variant'])
  const recipe = useRecipe({ key: 'textarea' })
  const textareaStyles = isUnstyled ? undefined : recipe(props)
  const onChange = props.onChange ?? (() => {})

  const typo = props.typography
  const contentTypography = typo
    ? {
        color: typo.color,
        '& .lexical-paragraph': {
          fontSize: typo.fontSize,
          lineHeight: typo.lineHeight,
          fontWeight: typo.fontWeight,
        },
      }
    : undefined

  return (
    <>
      <Box position='relative' w='full' display='grid'>
        <RichTextPlugin
          contentEditable={
            <Box ref={setFloatingAnchorElem} w='full' gridArea='1 / 1'>
              <ChakraContentEditable
                aria-multiline='true'
                overflow='auto'
                role='textbox'
                minH='30px'
                w='full'
                h='full'
                css={[textareaStyles, editor, contentTypography]}
              />
            </Box>
          }
          aria-placeholder={props.placeholder}
          placeholder={<></>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <PlaceholderPlugin placeholder={props.placeholder} textareaStyles={textareaStyles} typography={typo} />
      </Box>

      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ReadOnlyPlugin isDisabled={props.isDisabled} />
      <MarkdownValuePlugin value={props.value} transformers={TRANSFORMERS} />
      <OnChangeMarkdown onChange={onChange} transformers={TRANSFORMERS} />
      {props.maxLength && props.maxLength > 0 && <CharacterLimitPlugin maxLength={props.maxLength} charset='UTF-8' />}
      {floatingAnchorElem && !props.isDisabled && (
        <>
          <FloatingLinkEditorPlugin
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
          <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} setIsLinkEditMode={setIsLinkEditMode} />
        </>
      )}
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
    </>
  )
}

const Editor = (props: EditorProps) => {
  const initialMarkdown = props.value ?? props.defaultValue ?? ''

  const settings = {
    namespace: '',
    theme,
    onError(error: any) {
      throw error
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      OverflowNode,
    ],
    editorState(editor: any) {
      editor.update(() => {
        // Initialise content only — do NOT selectEnd()/focus here. Auto-focusing
        // on mount makes every inline editor (one per question/option) steal focus
        // as it initialises; with multiple questions the last one wins and yanks
        // focus away from whatever field the admin just clicked.
        $convertFromMarkdownString(initialMarkdown, TRANSFORMERS)
      })
    },
  }

  return (
    <LexicalComposer initialConfig={settings}>
      <MarkdownEditor {...props} />
    </LexicalComposer>
  )
}

export default Editor
