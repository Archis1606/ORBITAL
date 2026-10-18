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
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          handle: string
          discipline_focus: 'astrophotography' | 'aviation'
          bio: string
          location: string
          avatar_url: string | null
          social_twitter: string | null
          social_instagram: string | null
          social_website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          handle: string
          discipline_focus?: 'astrophotography' | 'aviation'
          bio?: string
          location?: string
          avatar_url?: string | null
          social_twitter?: string | null
          social_instagram?: string | null
          social_website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          handle?: string
          discipline_focus?: 'astrophotography' | 'aviation'
          bio?: string
          location?: string
          avatar_url?: string | null
          social_twitter?: string | null
          social_instagram?: string | null
          social_website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          title: string
          caption: string | null
          discipline: 'astrophotography' | 'aviation'
          category_tag: string | null
          tags: string[]
          storage_path: string | null
          storage_bucket: 'photos' | 'private-photos'
          image_url: string
          thumbnail_url: string | null
          width: number
          height: number
          camera: string | null
          optics: string | null
          exposure: string | null
          captured_at: string | null
          location_name: string | null
          latitude: number | null
          longitude: number | null
          allow_location_sharing: boolean
          // Astro fields
          astro_target: string | null
          astro_telescope: string | null
          astro_mount: string | null
          astro_filters: string | null
          astro_integration: string | null
          astro_bortle: number | null
          astro_notes: string | null
          // Aviation fields
          aviation_aircraft_type: string | null
          aviation_manufacturer: string | null
          aviation_airline: string | null
          aviation_airport_code: string | null
          aviation_airport_name: string | null
          aviation_country: string | null
          aviation_registration: string | null
          aviation_conditions: string | null
          // Status & stats
          status: 'published' | 'draft' | 'private'
          license: string
          featured: boolean
          views_count: number
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          caption?: string | null
          discipline: 'astrophotography' | 'aviation'
          category_tag?: string | null
          tags?: string[]
          storage_path?: string | null
          storage_bucket?: 'photos' | 'private-photos'
          image_url: string
          thumbnail_url?: string | null
          width?: number
          height?: number
          camera?: string | null
          optics?: string | null
          exposure?: string | null
          captured_at?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          allow_location_sharing?: boolean
          astro_target?: string | null
          astro_telescope?: string | null
          astro_mount?: string | null
          astro_filters?: string | null
          astro_integration?: string | null
          astro_bortle?: number | null
          astro_notes?: string | null
          aviation_aircraft_type?: string | null
          aviation_manufacturer?: string | null
          aviation_airline?: string | null
          aviation_airport_code?: string | null
          aviation_airport_name?: string | null
          aviation_country?: string | null
          aviation_registration?: string | null
          aviation_conditions?: string | null
          status?: 'published' | 'draft' | 'private'
          license?: string
          featured?: boolean
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          caption?: string | null
          discipline?: 'astrophotography' | 'aviation'
          category_tag?: string | null
          tags?: string[]
          storage_path?: string | null
          storage_bucket?: 'photos' | 'private-photos'
          image_url?: string
          thumbnail_url?: string | null
          width?: number
          height?: number
          camera?: string | null
          optics?: string | null
          exposure?: string | null
          captured_at?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          allow_location_sharing?: boolean
          astro_target?: string | null
          astro_telescope?: string | null
          astro_mount?: string | null
          astro_filters?: string | null
          astro_integration?: string | null
          astro_bortle?: number | null
          astro_notes?: string | null
          aviation_aircraft_type?: string | null
          aviation_manufacturer?: string | null
          aviation_airline?: string | null
          aviation_airport_code?: string | null
          aviation_airport_name?: string | null
          aviation_country?: string | null
          aviation_registration?: string | null
          aviation_conditions?: string | null
          status?: 'published' | 'draft' | 'private'
          license?: string
          featured?: boolean
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          photo_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          photo_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          photo_id?: string
          created_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          discipline: 'astrophotography' | 'aviation' | 'all'
          is_private: boolean
          cover_photo_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          discipline?: 'astrophotography' | 'aviation' | 'all'
          is_private?: boolean
          cover_photo_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          discipline?: 'astrophotography' | 'aviation' | 'all'
          is_private?: boolean
          cover_photo_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collection_photos: {
        Row: {
          collection_id: string
          photo_id: string
          sort_order: number
          created_at: string
        }
        Insert: {
          collection_id: string
          photo_id: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          collection_id?: string
          photo_id?: string
          sort_order?: number
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
  }
}
