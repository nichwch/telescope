export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lists: {
        Row: {
          chats: Json | null
          created_date: string | null
          id: string
          last_edited_date: string | null
          name: string | null
          owner: string
          strategic_goal: string | null
          tasks_blob: Json
        }
        Insert: {
          chats?: Json | null
          created_date?: string | null
          id?: string
          last_edited_date?: string | null
          name?: string | null
          owner: string
          strategic_goal?: string | null
          tasks_blob?: Json
        }
        Update: {
          chats?: Json | null
          created_date?: string | null
          id?: string
          last_edited_date?: string | null
          name?: string | null
          owner?: string
          strategic_goal?: string | null
          tasks_blob?: Json
        }
        Relationships: []
      }
      tasks: {
        Row: {
          ai_generated: boolean
          chats: Json | null
          child_index: number
          color: string | null
          created_at: string
          description: string
          done: boolean
          id: string
          list_parent: string | null
          name: string
          owner: string
          queued_done: boolean | null
          task_parent: string | null
        }
        Insert: {
          ai_generated?: boolean
          chats?: Json | null
          child_index: number
          color?: string | null
          created_at?: string
          description?: string
          done?: boolean
          id: string
          list_parent?: string | null
          name?: string
          owner: string
          queued_done?: boolean | null
          task_parent?: string | null
        }
        Update: {
          ai_generated?: boolean
          chats?: Json | null
          child_index?: number
          color?: string | null
          created_at?: string
          description?: string
          done?: boolean
          id?: string
          list_parent?: string | null
          name?: string
          owner?: string
          queued_done?: boolean | null
          task_parent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_list_parent_fkey"
            columns: ["list_parent"]
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_parent_fkey"
            columns: ["task_parent"]
            referencedRelation: "tasks"
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
