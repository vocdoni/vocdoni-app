type MaybePromise<T> = T | Promise<T>;
type MessageFn = (message: string) => void;
interface Task {
    title: string;
    task: (message: MessageFn) => MaybePromise<string | void>;
    enabled?: boolean;
}
export declare const tasks: (tasks: Task[]) => Promise<void>;
export {};
