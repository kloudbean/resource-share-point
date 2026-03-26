export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          reco_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          reco_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          reco_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_views: {
        Row: {
          agent_id: string
          duration_seconds: number | null
          id: string
          resource_key: string
          session_id: string | null
          viewed_at: string
        }
        Insert: {
          agent_id: string
          duration_seconds?: number | null
          id?: string
          resource_key: string
          session_id?: string | null
          viewed_at?: string
        }
        Update: {
          agent_id?: string
          duration_seconds?: number | null
          id?: string
          resource_key?: string
          session_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_views_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          content: Json | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          module_type: string
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: Json | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          module_type?: string
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: Json | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          module_type?: string
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          agent_id: string
          completed: boolean
          completed_at: string | null
          id: string
          module_id: string
          score: number | null
          updated_at: string
          watched_seconds: number
        }
        Insert: {
          agent_id: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          module_id: string
          score?: number | null
          updated_at?: string
          watched_seconds?: number
        }
        Update: {
          agent_id?: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          module_id?: string
          score?: number | null
          updated_at?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          is_mandatory: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          agent_id: string
          created_at: string
          event_id: string
          id: string
          notify_email: boolean
          status: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          event_id: string
          id?: string
          notify_email?: boolean
          status?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          event_id?: string
          id?: string
          notify_email?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string
          id: string
          is_active: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_active?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_active?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      meeting_rooms: {
        Row: {
          amenities: string | null
          capacity: number | null
          created_at: string
          id: string
          is_active: boolean
          is_virtual: boolean
          location_id: string
          name: string
        }
        Insert: {
          amenities?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_virtual?: boolean
          location_id: string
          name: string
        }
        Update: {
          amenities?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_virtual?: boolean
          location_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_rooms_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "office_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      office_locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          sort_order: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          sort_order?: number
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      precon_assets: {
        Row: {
          asset_type: string
          category: string
          created_at: string
          file_name: string
          file_url: string
          id: string
          is_active: boolean
          project_id: string | null
          title: string
        }
        Insert: {
          asset_type?: string
          category?: string
          created_at?: string
          file_name: string
          file_url: string
          id?: string
          is_active?: boolean
          project_id?: string | null
          title: string
        }
        Update: {
          asset_type?: string
          category?: string
          created_at?: string
          file_name?: string
          file_url?: string
          id?: string
          is_active?: boolean
          project_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "precon_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "precon_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      precon_projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          developer: string | null
          external_url: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          price_range: string | null
          status: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          developer?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          price_range?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          developer?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          price_range?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resource_links: {
        Row: {
          category: string
          created_at: string
          description: string | null
          drive_url: string | null
          id: string
          is_active: boolean
          resource_key: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          drive_url?: string | null
          id?: string
          is_active?: boolean
          resource_key: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          drive_url?: string | null
          id?: string
          is_active?: boolean
          resource_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      room_bookings: {
        Row: {
          agent_id: string
          created_at: string
          end_time: string
          id: string
          is_virtual: boolean
          meeting_link: string | null
          room_id: string
          start_time: string
          status: string
          title: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          end_time: string
          id?: string
          is_virtual?: boolean
          meeting_link?: string | null
          room_id: string
          start_time: string
          status?: string
          title: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_virtual?: boolean
          meeting_link?: string | null
          room_id?: string
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "meeting_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          agent_id: string
          category: string
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "agent"],
    },
  },
} as const
