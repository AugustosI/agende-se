// Testa login usando a chave ANON (como o frontend)
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (!m) continue
      const key = m[1].trim()
      let val = m[2]
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !anon) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, anon)

async function main() {
  const email = process.argv[2] || 'augustonanuque@gmail.com'
  const password = process.argv[3] || '12345678'

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('Erro de login:', error)
    process.exit(1)
  }
  console.log('Sessão criada. User ID:', data.user?.id)
}

main().catch(err => { console.error(err); process.exit(1) })
