declare namespace NodeJS {
  export interface ProcessEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL: string
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    readonly WHATSAPP_WEBHOOK_VERIFY_TOKEN: string
    readonly WHATSAPP_API_TOKEN?: string
    readonly WHATSAPP_PHONE_NUMBER_ID?: string
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly NEXT_PUBLIC_SITE_URL?: string
    readonly NEXT_PUBLIC_UPI_ID?: string
    readonly NEXT_PUBLIC_STORE_NAME?: string
    readonly NEXT_PUBLIC_SUPPORT_PHONE?: string
    readonly NEXT_PUBLIC_SUPPORT_EMAIL?: string
    readonly CRON_SECRET?: string
    readonly RESEND_API_KEY?: string
    readonly RESEND_FROM_EMAIL?: string
  }
}
