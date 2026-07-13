import {
  FieldErrorText,
  FieldErrorTextProps,
  FieldHelperText,
  FieldHelperTextProps,
  FieldLabel,
  FieldLabelProps,
  FieldRoot,
  FieldRootProps,
} from '@chakra-ui/react'
import * as React from 'react'

export interface FieldProps extends FieldRootProps {
  /** Label rendered above the control. Omit for label-less fields. */
  label?: React.ReactNode
  /** Helper text rendered below the control (always visible). */
  helperText?: React.ReactNode
  /** Error text rendered below the control. Only shown when the field is `invalid`. */
  errorText?: React.ReactNode
  /** Extra content appended inside the label (e.g. an "(optional)" hint). */
  optionalText?: React.ReactNode
  labelProps?: FieldLabelProps
  helperTextProps?: FieldHelperTextProps
  errorTextProps?: FieldErrorTextProps
  children: React.ReactNode
}

/**
 * Thin wrapper over Chakra v3's Field anatomy so call sites stop copy-pasting the
 * `FieldRoot as FormControl` / `FieldLabel as FormLabel` / `FieldErrorText as FormErrorMessage`
 * rename dance (repeated across ~27 files). Composes with any control passed as `children`
 * — Input, Select, InputGroup, or a custom widget. `invalid` / `required` / `disabled` flow
 * through as normal `FieldRoot` props.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
  const {
    label,
    helperText,
    errorText,
    optionalText,
    labelProps,
    helperTextProps,
    errorTextProps,
    children,
    ...rootProps
  } = props

  return (
    <FieldRoot ref={ref} {...rootProps}>
      {label && (
        <FieldLabel {...labelProps}>
          {label}
          {optionalText}
        </FieldLabel>
      )}
      {children}
      {helperText && <FieldHelperText {...helperTextProps}>{helperText}</FieldHelperText>}
      {errorText && <FieldErrorText {...errorTextProps}>{errorText}</FieldErrorText>}
    </FieldRoot>
  )
})
