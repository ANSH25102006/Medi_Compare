export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      hospitals: {
        Row: {
          id: string;
          name: string;
          city: string;
          state: string | null;
          address: string | null;
          hospital_type: string | null;
          description: string | null;
          rating: number;
          total_reviews: number;
          image_url: string | null;
          website: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          state?: string | null;
          address?: string | null;
          hospital_type?: string | null;
          description?: string | null;
          rating?: number;
          total_reviews?: number;
          image_url?: string | null;
          website?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          state?: string | null;
          address?: string | null;
          hospital_type?: string | null;
          description?: string | null;
          rating?: number;
          total_reviews?: number;
          image_url?: string | null;
          website?: string | null;
          phone?: string | null;
          created_at?: string;
        };
      };
      procedures: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      hospital_procedures: {
        Row: {
          id: string;
          hospital_id: string;
          procedure_id: string;
          price: number;
          currency: string;
          last_updated: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          hospital_id: string;
          procedure_id: string;
          price: number;
          currency?: string;
          last_updated?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          hospital_id?: string;
          procedure_id?: string;
          price?: number;
          currency?: string;
          last_updated?: string;
          updated_by?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "patient" | "doctor" | "hospital_admin" | "super_admin";
          phone: string | null;
          hospital_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "patient" | "doctor" | "hospital_admin" | "super_admin";
          phone?: string | null;
          hospital_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: "patient" | "doctor" | "hospital_admin" | "super_admin";
          phone?: string | null;
          hospital_id?: string | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          hospital_id: string;
          hospital_name: string | null;
          service_name: string | null;
          booking_date: string | null;
          booking_time: string | null;
          amount: number;
          booking_status: string;
          payment_id: string | null;
          payment_status: string | null;
          user_name: string | null;
          user_email: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          hospital_id: string;
          hospital_name?: string | null;
          service_name?: string | null;
          booking_date?: string | null;
          booking_time?: string | null;
          amount: number;
          booking_status?: string;
          payment_id?: string | null;
          payment_status?: string | null;
          user_name?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hospital_id?: string;
          hospital_name?: string | null;
          service_name?: string | null;
          booking_date?: string | null;
          booking_time?: string | null;
          amount?: number;
          booking_status?: string;
          payment_id?: string | null;
          payment_status?: string | null;
          user_name?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          hospital_id: string;
          user_name: string | null;
          user_email: string | null;
          rating: number;
          review_text: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          hospital_id: string;
          user_name?: string | null;
          user_email?: string | null;
          rating: number;
          review_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hospital_id?: string;
          user_name?: string | null;
          user_email?: string | null;
          rating?: number;
          review_text?: string | null;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          hospital_id: string;
          user_email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hospital_id: string;
          user_email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hospital_id?: string;
          user_email?: string;
          created_at?: string;
        };
      };
    };
  };
}
