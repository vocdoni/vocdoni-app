import { ReactNode, ForwardRefExoticComponent, RefAttributes } from 'react';
import { Assign } from '../../types';
import { HTMLProps, PolymorphicProps } from '../factory';
import { CreateToasterReturn } from './create-toaster';
import * as toast from '@zag-js/toast';
export type ToastOptions = toast.Options<ReactNode>;
export interface ToasterBaseProps extends PolymorphicProps, Omit<toast.GroupProps, 'store' | 'id'> {
    toaster: CreateToasterReturn;
    children: (toast: ToastOptions) => ReactNode;
}
export interface ToasterProps extends Assign<HTMLProps<'div'>, ToasterBaseProps> {
}
export declare const Toaster: ForwardRefExoticComponent<ToasterProps & RefAttributes<HTMLDivElement>>;
