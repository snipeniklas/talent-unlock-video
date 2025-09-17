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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      candidate_experience: {
        Row: {
          candidate_id: string | null
          end_date: string | null
          id: string
          org_name: string | null
          start_date: string | null
          summary: string | null
          tech_stack: Json | null
          title: string | null
        }
        Insert: {
          candidate_id?: string | null
          end_date?: string | null
          id?: string
          org_name?: string | null
          start_date?: string | null
          summary?: string | null
          tech_stack?: Json | null
          title?: string | null
        }
        Update: {
          candidate_id?: string | null
          end_date?: string | null
          id?: string
          org_name?: string | null
          start_date?: string | null
          summary?: string | null
          tech_stack?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_experience_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_identity: {
        Row: {
          avatar_url: string | null
          candidate_id: string
          city: string | null
          country: string | null
          first_name: string | null
          last_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          candidate_id: string
          city?: string | null
          country?: string | null
          first_name?: string | null
          last_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          candidate_id?: string
          city?: string | null
          country?: string | null
          first_name?: string | null
          last_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_identity_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_languages: {
        Row: {
          candidate_id: string
          lang_code: string
          proficiency: Database["public"]["Enums"]["proficiency"] | null
        }
        Insert: {
          candidate_id: string
          lang_code: string
          proficiency?: Database["public"]["Enums"]["proficiency"] | null
        }
        Update: {
          candidate_id?: string
          lang_code?: string
          proficiency?: Database["public"]["Enums"]["proficiency"] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_languages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_links: {
        Row: {
          candidate_id: string | null
          id: string
          label: string | null
          url: string | null
        }
        Insert: {
          candidate_id?: string | null
          id?: string
          label?: string | null
          url?: string | null
        }
        Update: {
          candidate_id?: string | null
          id?: string
          label?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_links_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          attributes: Json
          availability:
            | Database["public"]["Enums"]["availability_status"]
            | null
          bio: string | null
          created_at: string
          currency: string | null
          headline: string | null
          hours_per_week_pref: number | null
          id: string
          notice_period_days: number | null
          primary_role: string | null
          rate_hourly_target: number | null
          rate_monthly_target: number | null
          seniority: Database["public"]["Enums"]["seniority"] | null
          skills: Json
          start_earliest: string | null
          tenant_id: string | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          attributes?: Json
          availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          headline?: string | null
          hours_per_week_pref?: number | null
          id?: string
          notice_period_days?: number | null
          primary_role?: string | null
          rate_hourly_target?: number | null
          rate_monthly_target?: number | null
          seniority?: Database["public"]["Enums"]["seniority"] | null
          skills?: Json
          start_earliest?: string | null
          tenant_id?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          attributes?: Json
          availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          headline?: string | null
          hours_per_week_pref?: number | null
          id?: string
          notice_period_days?: number | null
          primary_role?: string | null
          rate_hourly_target?: number | null
          rate_monthly_target?: number | null
          seniority?: Database["public"]["Enums"]["seniority"] | null
          skills?: Json
          start_earliest?: string | null
          tenant_id?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          invited_role: Database["public"]["Enums"]["app_role"] | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_role?: Database["public"]["Enums"]["app_role"] | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_role?: Database["public"]["Enums"]["app_role"] | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      search_request_allocations: {
        Row: {
          allocated_at: string
          allocated_by: string
          candidate_id: string
          client_feedback: string | null
          client_status: string | null
          created_at: string
          feedback_date: string | null
          id: string
          notes: string | null
          search_request_id: string
          status: string
          updated_at: string
        }
        Insert: {
          allocated_at?: string
          allocated_by: string
          candidate_id: string
          client_feedback?: string | null
          client_status?: string | null
          created_at?: string
          feedback_date?: string | null
          id?: string
          notes?: string | null
          search_request_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          allocated_at?: string
          allocated_by?: string
          candidate_id?: string
          client_feedback?: string | null
          client_status?: string | null
          created_at?: string
          feedback_date?: string | null
          id?: string
          notes?: string | null
          search_request_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_requests: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          customer_industry: string | null
          description: string | null
          employment_type: string | null
          end_date: string | null
          experience_level: string | null
          experience_level_new: string | null
          id: string
          job_title: string | null
          location: string | null
          main_tasks: string[] | null
          number_of_workers: number | null
          requirements: string | null
          requirements_list: string[] | null
          salary_max: number | null
          salary_min: number | null
          skills_list: string[] | null
          skills_required: string[] | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          weekly_hours: number | null
          work_areas: string[] | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          customer_industry?: string | null
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          experience_level?: string | null
          experience_level_new?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          main_tasks?: string[] | null
          number_of_workers?: number | null
          requirements?: string | null
          requirements_list?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills_list?: string[] | null
          skills_required?: string[] | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          weekly_hours?: number | null
          work_areas?: string[] | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          customer_industry?: string | null
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          experience_level?: string | null
          experience_level_new?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          main_tasks?: string[] | null
          number_of_workers?: number | null
          requirements?: string | null
          requirements_list?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills_list?: string[] | null
          skills_required?: string[] | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          weekly_hours?: number | null
          work_areas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "search_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_internal: boolean
          sender_id: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string
          ticket_id?: string
          updated_at?: string
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
          assigned_to: string | null
          category: string
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          priority: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      get_user_company: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "company_admin" | "user"
      availability_status: "immediately" | "notice_period" | "booked" | "paused"
      proficiency: "basic" | "conversational" | "fluent" | "native"
      seniority: "junior" | "mid" | "senior" | "lead"
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
      app_role: ["admin", "company_admin", "user"],
      availability_status: ["immediately", "notice_period", "booked", "paused"],
      proficiency: ["basic", "conversational", "fluent", "native"],
      seniority: ["junior", "mid", "senior", "lead"],
    },
  },
} as const
