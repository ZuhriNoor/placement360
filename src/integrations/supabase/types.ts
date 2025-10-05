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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      placement_rounds: {
        Row: {
          created_at: string
          difficulty: number | null
          id: string
          pass_status: Database["public"]["Enums"]["pass_status"] | null
          review_id: string
          round_name: string | null
          round_order: number
          round_type: Database["public"]["Enums"]["round_type"]
          sections: string | null
          tips: string | null
          topics_covered: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          id?: string
          pass_status?: Database["public"]["Enums"]["pass_status"] | null
          review_id: string
          round_name?: string | null
          round_order: number
          round_type: Database["public"]["Enums"]["round_type"]
          sections?: string | null
          tips?: string | null
          topics_covered?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          id?: string
          pass_status?: Database["public"]["Enums"]["pass_status"] | null
          review_id?: string
          round_name?: string | null
          round_order?: number
          round_type?: Database["public"]["Enums"]["round_type"]
          sections?: string | null
          tips?: string | null
          topics_covered?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placement_rounds_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          batch: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          batch?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          batch?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          batch: string | null
          company_id: string
          created_at: string
          ctc_stipend: string | null
          final_offer_status: string | null
          id: string
          is_anonymous: boolean | null
          position_applied_for: string | null
          review_type: Database["public"]["Enums"]["review_type"]
          status: Database["public"]["Enums"]["review_status"]
          timeline: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          batch?: string | null
          company_id: string
          created_at?: string
          ctc_stipend?: string | null
          final_offer_status?: string | null
          id?: string
          is_anonymous?: boolean | null
          position_applied_for?: string | null
          review_type: Database["public"]["Enums"]["review_type"]
          status?: Database["public"]["Enums"]["review_status"]
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          batch?: string | null
          company_id?: string
          created_at?: string
          ctc_stipend?: string | null
          final_offer_status?: string | null
          id?: string
          is_anonymous?: boolean | null
          position_applied_for?: string | null
          review_type?: Database["public"]["Enums"]["review_type"]
          status?: Database["public"]["Enums"]["review_status"]
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
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
      work_experience_details: {
        Row: {
          cons: string | null
          created_at: string
          culture_rating: number | null
          department: string | null
          growth_prospects: string | null
          id: string
          job_title: string
          learning_opportunities: string | null
          overall_experience: string | null
          pros: string | null
          review_id: string
          work_life_balance: number | null
        }
        Insert: {
          cons?: string | null
          created_at?: string
          culture_rating?: number | null
          department?: string | null
          growth_prospects?: string | null
          id?: string
          job_title: string
          learning_opportunities?: string | null
          overall_experience?: string | null
          pros?: string | null
          review_id: string
          work_life_balance?: number | null
        }
        Update: {
          cons?: string | null
          created_at?: string
          culture_rating?: number | null
          department?: string | null
          growth_prospects?: string | null
          id?: string
          job_title?: string
          learning_opportunities?: string | null
          overall_experience?: string | null
          pros?: string | null
          review_id?: string
          work_life_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_details_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "user" | "admin"
      pass_status: "passed" | "failed" | "waiting"
      review_status: "pending" | "approved" | "rejected"
      review_type: "placement" | "work_experience"
      round_type:
        | "assessment"
        | "coding"
        | "technical_interview"
        | "hr_interview"
        | "other"
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
      app_role: ["user", "admin"],
      pass_status: ["passed", "failed", "waiting"],
      review_status: ["pending", "approved", "rejected"],
      review_type: ["placement", "work_experience"],
      round_type: [
        "assessment",
        "coding",
        "technical_interview",
        "hr_interview",
        "other",
      ],
    },
  },
} as const
