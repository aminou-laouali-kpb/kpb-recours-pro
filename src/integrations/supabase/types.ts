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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activation_codes: {
        Row: {
          activated_at: string | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          order_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activation_codes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          assessment_id: string | null
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "free_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      free_assessments: {
        Row: {
          created_at: string
          current_academic_level: string | null
          field_of_study: string | null
          id: string
          institutions_applied_to: string[] | null
          program_applied_for: string | null
          recommended_next_step: string | null
          result_category: string | null
          result_explanation: string | null
          target_level_in_france: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_academic_level?: string | null
          field_of_study?: string | null
          id?: string
          institutions_applied_to?: string[] | null
          program_applied_for?: string | null
          recommended_next_step?: string | null
          result_category?: string | null
          result_explanation?: string | null
          target_level_in_france?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_academic_level?: string | null
          field_of_study?: string | null
          id?: string
          institutions_applied_to?: string[] | null
          program_applied_for?: string | null
          recommended_next_step?: string | null
          result_category?: string | null
          result_explanation?: string | null
          target_level_in_france?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generated_letters: {
        Row: {
          created_at: string
          id: string
          input_payload: Json
          letter_text: string
          premium_access_id: string
          program_name: string
          university_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_payload?: Json
          letter_text: string
          premium_access_id: string
          program_name: string
          university_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_payload?: Json
          letter_text?: string
          premium_access_id?: string
          program_name?: string
          university_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_letters_premium_access_id_fkey"
            columns: ["premium_access_id"]
            isOneToOne: false
            referencedRelation: "premium_access"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          assessment_id: string | null
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          payment_payload: Json | null
          provider: string
          reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          assessment_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_payload?: Json | null
          provider?: string
          reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          assessment_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_payload?: Json | null
          provider?: string
          reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "free_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_access: {
        Row: {
          assessment_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          max_letters: number
          order_id: string | null
          status: string
          used_letters: number
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          max_letters?: number
          order_id?: string | null
          status?: string
          used_letters?: number
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          max_letters?: number
          order_id?: string | null
          status?: string
          used_letters?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_access_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "free_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_access_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          nationality: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
