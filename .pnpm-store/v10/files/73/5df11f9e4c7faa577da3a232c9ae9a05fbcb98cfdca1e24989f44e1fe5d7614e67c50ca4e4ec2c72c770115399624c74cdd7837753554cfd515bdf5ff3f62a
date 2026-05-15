/**
 * This function emulates the Promise.allSettled()
 *
 * @param proms -
 */
export function allSettled(
  proms: Promise<any>[]
): Promise<({ value: any; status: string } | { reason: Error; status: string })[]> {
  return Promise.all(proms.map(reflect));
}

export function reflect<T>(prom: Promise<T>) {
  return prom
    .then((value: T) => ({ value, status: 'fulfilled' }))
    .catch((reason: T) => ({ reason, status: 'rejected' }));
}

/**
 * This function emulates the Promise.any()
 *
 * @param values -
 */
export function promiseAny<T>(values: Iterable<T | PromiseLike<T>>): Promise<T> {
  return new Promise<T>((resolve: (value: T) => void, reject: (reason?: any) => void): void => {
    let hasResolved: boolean = false;
    const promiseLikes: (T | PromiseLike<T>)[] = [];
    let iterableCount: number = 0;
    const rejectionReasons: any[] = [];

    function resolveOnce(value: T): void {
      if (!hasResolved) {
        hasResolved = true;
        resolve(value);
      }
    }

    function rejectionCheck(reason?: any): void {
      rejectionReasons.push(reason);
      if (rejectionReasons.length >= iterableCount) reject(rejectionReasons);
    }

    for (const value of values) {
      iterableCount++;
      promiseLikes.push(value);
    }

    for (const promiseLike of promiseLikes) {
      if ((promiseLike as PromiseLike<T>)?.then !== undefined || (promiseLike as Promise<T>)?.catch !== undefined) {
        (promiseLike as Promise<T>)?.then((result: T): void => resolveOnce(result))?.catch((): void => undefined);
        (promiseLike as Promise<T>)?.catch((reason?: any): void => rejectionCheck(reason));
      } else resolveOnce(promiseLike as T);
    }
  });
}
