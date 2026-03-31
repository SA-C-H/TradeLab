export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: 'real' | 'demo' | 'prop_firm' | 'paper';
          initial_capital: number;
          currency: string;
          broker: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type: 'real' | 'demo' | 'prop_firm' | 'paper';
          initial_capital: number;
          currency: string;
          broker?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: 'real' | 'demo' | 'prop_farm' | 'paper';
          initial_capital?: number;
          currency?: string;
          broker?: string | null;
          updated_at?: string;
        };
      };
      trading_journal: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          date: string;
          title: string;
          content: string | null;
          mood: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible' | null;
          tags: string[];
          images: string[];
          videos: string[];
          trade_ids: string[];
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          date: string;
          title: string;
          content?: string | null;
          mood?: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible' | null;
          tags?: string[];
          images?: string[];
          videos?: string[];
          trade_ids?: string[];
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          date?: string;
          title?: string;
          content?: string | null;
          mood?: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible' | null;
          tags?: string[];
          images?: string[];
          videos?: string[];
          trade_ids?: string[];
          is_private?: boolean;
          updated_at?: string;
        };
      };
      journal_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
        };
      };
      playbook_conditions: {
        Row: {
          id: string;
          user_id: string;
          strategy_id: string;
          name: string;
          description: string;
          is_required: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          strategy_id: string;
          name: string;
          description: string;
          is_required: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          strategy_id?: string;
          name?: string;
          description?: string;
          is_required?: boolean;
        };
      };
      trading_strategies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          initial_capital: number;
          risk_per_trade_percent: number;
          default_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          initial_capital: number;
          risk_per_trade_percent: number;
          default_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          initial_capital?: number;
          risk_per_trade_percent?: number;
          default_account_id?: string | null;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          session: string;
          instrument: string;
          trade_date: string;
          trade_time: string;
          direction: string;
          entry_price: number;
          stop_loss: number;
          take_profit: number;
          result: string;
          risk_percent: number;
          risk_amount: number;
          reason: string;
          emotion_before: string;
          emotion_during: string;
          emotion_after: string;
          strategy_id: string | null;
          playbook_checks: Record<string, boolean>;
          images_before: string[] | null;
          images_after: string[] | null;
          is_valid: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          session: string;
          instrument: string;
          trade_date: string;
          trade_time: string;
          direction: string;
          entry_price: number;
          stop_loss: number;
          take_profit: number;
          result: string;
          risk_percent: number;
          risk_amount: number;
          reason: string;
          emotion_before: string;
          emotion_during: string;
          emotion_after: string;
          strategy_id?: string | null;
          playbook_checks?: Record<string, boolean>;
          images_before?: string[] | null;
          images_after?: string[] | null;
          is_valid?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          session?: string;
          instrument?: string;
          trade_date?: string;
          trade_time?: string;
          direction?: string;
          entry_price?: number;
          stop_loss?: number;
          take_profit?: number;
          result?: string;
          risk_percent?: number;
          risk_amount?: number;
          reason?: string;
          emotion_before?: string;
          emotion_during?: string;
          emotion_after?: string;
          strategy_id?: string | null;
          playbook_checks?: Record<string, boolean>;
          images_before?: string[] | null;
          images_after?: string[] | null;
          is_valid?: boolean;
        };
      };
    };
    Functions: {
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: never;
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

type Tables<
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
