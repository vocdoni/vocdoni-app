import { JSX } from 'react';
import { Assign } from '../../types';
import { CollectionItem } from '../collection';
import { HTMLProps, PolymorphicProps } from '../factory';
import { UsePresenceProps } from '../presence';
import { UseSelectProps } from './use-select';
export interface SelectRootBaseProps<T extends CollectionItem> extends UseSelectProps<T>, UsePresenceProps, PolymorphicProps {
}
export interface SelectRootProps<T extends CollectionItem> extends Assign<HTMLProps<'div'>, SelectRootBaseProps<T>> {
}
export type SelectRootComponentProps<T extends CollectionItem = CollectionItem, P = {}> = Assign<SelectRootProps<T>, P> & React.RefAttributes<HTMLDivElement>;
export type SelectRootComponent<P = {}> = <T extends CollectionItem>(props: SelectRootComponentProps<T, P>) => JSX.Element;
export declare const SelectRoot: SelectRootComponent;
