import { Box, chakra, Text, TextareaProps, useRecipe } from '@chakra-ui/react'
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
import { $getRoot } from 'lexical'
import { useState } from 'react'

import { FloatingLinkEditorPlugin, FloatingTextFormatToolbarPlugin } from './plugins'
import OnChangeMarkdown from './plugins/OnChangeMarkdown'
import ReadOnlyPlugin from './plugins/ReadOnlyPlugin'

type EditorProps = {
  isDisabled?: boolean
  maxLength?: number
  onChange?: (value: string) => void
  placeholder?: string
  defaultValue?: string
  value?: string
  variant?: TextareaProps['variant']
  padding?: TextareaProps['padding']
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

  return (
    <>
      <Box position='relative' w='full'>
        <RichTextPlugin
          contentEditable={
            <Box ref={setFloatingAnchorElem} w='full'>
              <ChakraContentEditable
                aria-multiline='true'
                overflow='auto'
                role='textbox'
                minH='30px'
                css={textareaStyles}
              />
            </Box>
          }
          aria-placeholder={props.placeholder}
          placeholder={
            <Text position='absolute' top={0} pointerEvents='none' css={textareaStyles} data-placeholder>
              {props.placeholder}
            </Text>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </Box>

      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ReadOnlyPlugin isDisabled={props.isDisabled} />
      <OnChangeMarkdown onChange={props.onChange} transformers={TRANSFORMERS} />
      {props.maxLength && props.maxLength > 0 && <CharacterLimitPlugin maxLength={props.maxLength} charset='UTF-8' />}
      {floatingAnchorElem && (
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
  const initialMarkdown = props.defaultValue ?? ''

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
        $convertFromMarkdownString(initialMarkdown, TRANSFORMERS)
        $getRoot().selectEnd()
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
