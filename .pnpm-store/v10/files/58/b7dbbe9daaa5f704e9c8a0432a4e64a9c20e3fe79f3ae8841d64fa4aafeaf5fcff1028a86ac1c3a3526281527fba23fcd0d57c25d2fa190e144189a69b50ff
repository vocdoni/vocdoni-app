import { JSX, RefAttributes } from 'react';
import { Assign } from '../../types';
import { CollectionItem } from '../collection';
import { HTMLProps, PolymorphicProps } from '../factory';
import { UsePresenceProps } from '../presence';
import { UseComboboxProps } from './use-combobox';
export interface ComboboxRootBaseProps<T extends CollectionItem> extends UseComboboxProps<T>, UsePresenceProps, PolymorphicProps {
}
export interface ComboboxRootProps<T extends CollectionItem> extends Assign<HTMLProps<'div'>, ComboboxRootBaseProps<T>> {
}
export type ComboboxRootComponentProps<T extends CollectionItem = CollectionItem, P = {}> = Assign<ComboboxRootProps<T>, P> & RefAttributes<HTMLDivElement>;
export type ComboboxRootComponent<P = {}> = <T extends CollectionItem>(props: ComboboxRootComponentProps<T, P>) => JSX.Element;
export declare const ComboboxRoot: ComboboxRootComponent;
