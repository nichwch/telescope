import type { Database } from '../DatabaseDefinitions';

export type Task = Database['public']['Tables']['tasks']['Row'];

// make optional fields optional before we flush the task to the database
export type IntermediateTask = Partial<Task> &
	Pick<Task, 'description' | 'done' | 'id' | 'name' | 'queued_done'>;
