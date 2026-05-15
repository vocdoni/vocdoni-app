'use client';
import * as asyncList from '@zag-js/async-list';
import { useMachine } from '@zag-js/react';

function useAsyncList(props) {
  const service = useMachine(asyncList.machine, props);
  return asyncList.connect(service);
}

export { useAsyncList };
