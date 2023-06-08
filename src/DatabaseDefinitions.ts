export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lists: {
        Row: {
          created_date: string | null
          id: string
          last_edited_date: string | null
          owner: string
          strategic_goal: string | null
          tasks_blob: Json | null
        }
        Insert: {
          created_date?: string | null
          id?: string
          last_edited_date?: string | null
          owner: string
          strategic_goal?: string | null
          tasks_blob?: Json | null
        }
        Update: {
          created_date?: string | null
          id?: string
          last_edited_date?: string | null
          owner?: string
          strategic_goal?: string | null
          tasks_blob?: Json | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          content: string | null
          creation_date: string
          finished: boolean
          id: string
          last_edited_date: string
          parent_list: string | null
          parent_task: string | null
        }
        Insert: {
          content?: string | null
          creation_date?: string
          finished?: boolean
          id?: string
          last_edited_date?: string
          parent_list?: string | null
          parent_task?: string | null
        }
        Update: {
          content?: string | null
          creation_date?: string
          finished?: boolean
          id?: string
          last_edited_date?: string
          parent_list?: string | null
          parent_task?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_list_fkey"
            columns: ["parent_list"]
            referencedRelation: "lists"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
