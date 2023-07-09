export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			lists: {
				Row: {
					created_date: string | null;
					id: string;
					last_edited_date: string | null;
					name: string | null;
					owner: string;
					strategic_goal: string | null;
					tasks_blob: Json;
				};
				Insert: {
					created_date?: string | null;
					id?: string;
					last_edited_date?: string | null;
					name?: string | null;
					owner: string;
					strategic_goal?: string | null;
					tasks_blob?: Json;
				};
				Update: {
					created_date?: string | null;
					id?: string;
					last_edited_date?: string | null;
					name?: string | null;
					owner?: string;
					strategic_goal?: string | null;
					tasks_blob?: Json;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
