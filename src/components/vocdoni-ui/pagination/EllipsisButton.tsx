import { Button, Input, chakra, type ButtonProps, type InputProps, useSlotRecipe } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export type EllipsisButtonProps = ButtonProps & {
  gotoPage: (page: number) => void
  inputProps?: InputProps
}

export const EllipsisButton = ({ gotoPage, inputProps, ...rest }: EllipsisButtonProps) => {
  const [ellipsisInput, setEllipsisInput] = useState(false)
  const { t } = useTranslation()
  const recipe = useSlotRecipe({ key: 'EllipsisButton' })
  const styles = recipe()

  if (ellipsisInput) {
    return (
      <Input
        placeholder={t('pagination.page_placeholder', { defaultValue: 'Page' })}
        width='50px'
        css={styles.input}
        {...inputProps}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLInputElement && event.key === 'Enter') {
            const pageNumber = Number(event.target.value)
            gotoPage(pageNumber)
            setEllipsisInput(false)
          }
        }}
        onBlur={() => setEllipsisInput(false)}
        autoFocus
      />
    )
  }

  return (
    <Button
      asChild
      css={styles.button}
      {...rest}
      onClick={(event) => {
        event.preventDefault()
        setEllipsisInput(true)
      }}
    >
      <chakra.a href='#goto-page'>...</chakra.a>
    </Button>
  )
}
