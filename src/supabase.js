import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://smbctkyjtmyzxuweebxt.supabase.co'
const supabaseKey = 'sb_publishable__dO48V7mTB5cmKN38qDVDA_S6umw_5u'

export const supabase = createClient(supabaseUrl, supabaseKey)