import { useQuery } from '@tanstack/react-query';
import type { Task } from '../../gen/tasks_pb';
import { taskClient } from '../clients';
import { keys } from '../keys';

export type { Task as TaskMessage };

export function useTasks() {
  return useQuery({
    queryKey: keys.tasksPrefix,
    queryFn: async () => (await taskClient.listTasks({})).tasks,
  });
}
