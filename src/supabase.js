import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://smbctkyjtmyzxuweebxt.supabase.co'
const supabaseKey = 'sb_publishable__dO48V7mTB5cmKN38qDVDA_S6umw_5uUR_PUBLISHABLE_KEY_HERE'

export const supabase = createClient(supabaseUrl, supabaseKey)