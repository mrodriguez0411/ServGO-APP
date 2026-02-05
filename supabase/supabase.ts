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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          activa: boolean
          descripcion: string | null
          fecha_actualizacion: string
          fecha_creacion: string
          icono: string | null
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          activa?: boolean
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          icono?: string | null
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          activa?: boolean
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          icono?: string | null
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          estado: string
          fecha_creacion: string
          id: string
          rechazo_motivo: string | null
          revisado_en: string | null
          revisado_por: string | null
          subido_en: string
          tipo: string
          url: string
          user_id: string
        }
        Insert: {
          estado?: string
          fecha_creacion?: string
          id?: string
          rechazo_motivo?: string | null
          revisado_en?: string | null
          revisado_por?: string | null
          subido_en?: string
          tipo: string
          url: string
          user_id: string
        }
        Update: {
          estado?: string
          fecha_creacion?: string
          id?: string
          rechazo_motivo?: string | null
          revisado_en?: string | null
          revisado_por?: string | null
          subido_en?: string
          tipo?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_outbox: {
        Row: {
          channel: string
          created_at: string
          id: string
          payload: Json
          processed_at: string | null
          template: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          template: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          template?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_outbox_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          estado: string | null
          fecha_creacion: string
          fecha_pago: string
          id: string
          monto: number
          turno_id: string
        }
        Insert: {
          estado?: string | null
          fecha_creacion?: string
          fecha_pago?: string
          id?: string
          monto: number
          turno_id: string
        }
        Update: {
          estado?: string | null
          fecha_creacion?: string
          fecha_pago?: string
          id?: string
          monto?: number
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      profesionales_categorias: {
        Row: {
          categoria_id: string
          fecha_creacion: string
          usuario_id: string
        }
        Insert: {
          categoria_id: string
          fecha_creacion?: string
          usuario_id: string
        }
        Update: {
          categoria_id?: string
          fecha_creacion?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profesionales_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profesionales_categorias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      resenas: {
        Row: {
          calificacion: number
          cliente_id: string
          comentario: string | null
          fecha_creacion: string
          id: string
          servicio_id: string
          turno_id: string
        }
        Insert: {
          calificacion: number
          cliente_id: string
          comentario?: string | null
          fecha_creacion?: string
          id?: string
          servicio_id: string
          turno_id: string
        }
        Update: {
          calificacion?: number
          cliente_id?: string
          comentario?: string | null
          fecha_creacion?: string
          id?: string
          servicio_id?: string
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resenas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: true
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          activo: boolean
          categoria: string | null
          descripcion: string | null
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          imagen: string | null
          precio: number | null
          profesional_id: string
          titulo: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen?: string | null
          precio?: number | null
          profesional_id: string
          titulo: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen?: string | null
          precio?: number | null
          profesional_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicios_profesional_id_fkey"
            columns: ["profesional_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios_categorias: {
        Row: {
          categoria_id: string
          fecha_creacion: string
          servicio_id: string
        }
        Insert: {
          categoria_id: string
          fecha_creacion?: string
          servicio_id: string
        }
        Update: {
          categoria_id?: string
          fecha_creacion?: string
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicios_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicios_categorias_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          cliente_id: string
          estado: string | null
          fecha: string
          fecha_actualizacion: string
          fecha_creacion: string
          hora: string
          id: string
          observaciones: string | null
          servicio_id: string
        }
        Insert: {
          cliente_id: string
          estado?: string | null
          fecha: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          hora: string
          id?: string
          observaciones?: string | null
          servicio_id: string
        }
        Update: {
          cliente_id?: string
          estado?: string | null
          fecha?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          hora?: string
          id?: string
          observaciones?: string | null
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnos_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          email: string
          fecha_actualizacion: string
          fecha_creacion: string
          foto: string | null
          id: string
          is_active: boolean
          is_admin: boolean
          is_verified: boolean
          last_verification_attempt: string | null
          nombre: string
          phone_verified: boolean
          phone_verified_at: string | null
          telefono: string | null
          tipo: string
          verification_status: string
          verification_step: string
        }
        Insert: {
          email: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          foto?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          is_verified?: boolean
          last_verification_attempt?: string | null
          nombre: string
          phone_verified?: boolean
          phone_verified_at?: string | null
          telefono?: string | null
          tipo: string
          verification_status?: string
          verification_step?: string
        }
        Update: {
          email?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          foto?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          is_verified?: boolean
          last_verification_attempt?: string | null
          nombre?: string
          phone_verified?: boolean
          phone_verified_at?: string | null
          telefono?: string | null
          tipo?: string
          verification_status?: string
          verification_step?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user: {
        Args: { p_reviewer: string; p_user_id: string }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
