// Cria um usuário no Supabase Auth e faz seed de empresa/profile usando service_role
// Usa variáveis do .env.local

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carrega .env.local manualmente (dotenv é opcional)
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (!m) continue
      const key = m[1].trim()
      let val = m[2]
      // remove possíveis aspas
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  }
} catch (e) {
  // segue sem abortar
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltam variáveis: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function ensureUser(email, password, nome) {
  // tenta localizar usuário por email
  let user = null
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listErr) {
    console.warn('Falha ao listar usuários:', listErr)
  } else {
    user = (list.users || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase()) || null
  }

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome }
    })
    if (error) {
      console.error('Erro ao criar usuário:', error)
      process.exit(1)
    }
    user = data.user
  }
  return user
}

async function upsertEmpresa(nome) {
  const { data, error } = await admin
    .from('empresas')
    .upsert({ nome }, { onConflict: 'nome' })
    .select()
    .single()
  if (error) {
    console.error('Erro ao upsert empresa:', error)
    process.exit(1)
  }
  return data
}

async function upsertProfile(userId, nome, empresa_id) {
  const { data, error } = await admin
    .from('profiles')
    .upsert({ id: userId, nome, empresa_id }, { onConflict: 'id' })
    .select()
    .single()
  if (error) {
    console.error('Erro ao upsert profile:', error)
    process.exit(1)
  }
  return data
}

async function main() {
  const nome = process.argv[2] || 'Augusto'
  const email = process.argv[3] || 'augustonanuque@gmail.com'
  const senha = process.argv[4] || '12345678'
  const empresaNome = process.argv[5] || 'Estúdio Delicata'

  console.log('Criando/verificando usuário:', email)
  const user = await ensureUser(email, senha, nome)
  console.log('User ID:', user.id)

  console.log('Criando/verificando empresa:', empresaNome)
  const empresa = await upsertEmpresa(empresaNome)
  console.log('Empresa ID:', empresa.id)

  console.log('Vinculando profile ao usuário')
  const profile = await upsertProfile(user.id, nome, empresa.id)
  console.log('Profile pronto:', profile)

  console.log('OK')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
