"use strict";
import { spinner } from '@clack/prompts';

const tasks = async (tasks2) => {
  for (const task of tasks2) {
    if (task.enabled === false) continue;
    const s = spinner();
    s.start(task.title);
    try {
      const result = await task.task(s.message);
      s.stop(result || task.title);
    } catch (error) {
      s.stop(`${task.title}
` + String(error));
      throw error;
    }
  }
};

export { tasks };
