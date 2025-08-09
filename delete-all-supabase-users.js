// Script para deletar todos os usuários do Supabase Auth via API Admin
// ATENÇÃO: Use apenas no backend/local, nunca exponha a service_role key no frontend!
// Como usar:
// 1. Preencha PROJECT_URL e SERVICE_ROLE_KEY com os dados do seu projeto Supabase
// 2. Rode: node delete-all-supabase-users.js

const fetch = require('node-fetch');

const PROJECT_URL = 'https://xqjjsrtllcsyggspfuun.supabase.co'; // Substitua pelo seu
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxampzcnRsbGNzeWdnc3BmdXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcwMDg1OCwiZXhwIjoyMDcwMjc2ODU4fQ.TvkBTZd9HXh01Hegoow1tDLTMrD-DRTFZOWG5i-o5_4'; // Substitua pelo seu

async function getAllUsers() {
  const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users?perPage=1000`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error('Erro ao listar usuários');
  const data = await res.json();
  return data.users || [];
}

async function deleteUser(id) {
  const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) {
    console.error(`Erro ao deletar usuário ${id}`);
  } else {
    console.log(`Usuário ${id} deletado.`);
  }
}

(async () => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      console.log('Nenhum usuário encontrado.');
      return;
    }
    for (const user of users) {
      await deleteUser(user.id);
    }
    console.log('Processo concluído.');
  } catch (e) {
    console.error(e);
  }
})();
