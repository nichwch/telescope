import type { Database } from '../DatabaseDefinitions';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type Children = {
	tasks:
		| {
				id: string;
		  }[]
		| null;
};
export type TaskWithChildren = Task & Children;

// make optional fields optional before we flush the task to the database
export type IntermediateTask = Partial<Task> &
	Pick<Task, 'description' | 'done' | 'id' | 'name' | 'queued_done' | 'ai_generated'>;

export type IntermediateTaskWithIndex = IntermediateTask & Pick<Task, 'child_index'>;
export type IntermediateTaskWithChildren = IntermediateTask & Children;

export type SubscriptionType = 'free' | 'plus' | 'pro';
