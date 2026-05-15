import { JSX } from 'react';
import { Assign } from '../../types';
import { CollectionItem } from '../collection';
import { HTMLProps, PolymorphicProps } from '../factory';
import { UseListboxProps } from './use-listbox';
export interface ListboxRootBaseProps<T extends CollectionItem> extends UseListboxProps<T>, PolymorphicProps {
}
export interface ListboxRootProps<T extends CollectionItem> extends Assign<HTMLProps<'div'>, ListboxRootBaseProps<T>> {
}
export type ListboxRootComponentProps<T extends CollectionItem = CollectionItem, P = {}> = Assign<ListboxRootProps<T>, P> & React.RefAttributes<HTMLDivElement>;
export type ListboxRootComponent<P = {}> = <T extends CollectionItem>(props: ListboxRootComponentProps<T, P>) => JSX.Element;
export declare const ListboxRoot: ListboxRootComponent;
