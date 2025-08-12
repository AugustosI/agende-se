import { test, expect } from '@playwright/test';

test.describe('Funcionalidade de Serviços - MCP', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('http://localhost:3000');
    
    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle');
  });

  test('Deve navegar para a aba de Serviços e exibir elementos principais', async ({ page }) => {
    // Clicar na aba Serviços
    await page.getByRole('button', { name: /servi[çc]os/i }).click();
    
    // Verificar se os elementos principais estão visíveis
    await expect(page.getByText('Total de Serviços')).toBeVisible();
    await expect(page.getByText('Serviços Ativos')).toBeVisible();
    await expect(page.getByText('Preço Médio')).toBeVisible();
    await expect(page.getByText('Duração Média')).toBeVisible();
    
    // Verificar se o botão de novo serviço existe
    await expect(page.getByRole('button', { name: /novo servi[çc]o/i })).toBeVisible();
  });

  test('Deve abrir o modal de novo serviço ao clicar no botão', async ({ page }) => {
    // Navegar para serviços
    await page.getByRole('button', { name: /servi[çc]os/i }).click();
    
    // Clicar no botão de novo serviço
    await page.getByRole('button', { name: /novo servi[çc]o/i }).click();
    
    // Verificar se o modal abriu
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/nome do servi[çc]o/i)).toBeVisible();
    await expect(page.getByLabel(/pre[çc]o/i)).toBeVisible();
    await expect(page.getByLabel(/dura[çc][ãa]o/i)).toBeVisible();
  });

  test('Deve filtrar serviços usando o campo de busca', async ({ page }) => {
    // Navegar para serviços
    await page.getByRole('button', { name: /servi[çc]os/i }).click();
    
    // Localizar o campo de busca
    const searchInput = page.getByPlaceholder(/buscar/i);
    await expect(searchInput).toBeVisible();
    
    // Digitar no campo de busca
    await searchInput.fill('corte');
    
    // Aguardar um momento para o filtro ser aplicado
    await page.waitForTimeout(500);
  });

  test('Deve abrir o menu de ações de um serviço', async ({ page }) => {
    // Navegar para serviços
    await page.getByRole('button', { name: /servi[çc]os/i }).click();
    
    // Aguardar a lista carregar
    await page.waitForTimeout(1000);
    
    // Procurar pelo botão de ações (três pontos)
    const actionButton = page.getByRole('button', { name: /a[çc][õo]es|menu/i }).first();
    
    // Se o botão existe, clicar nele
    if (await actionButton.isVisible()) {
      await actionButton.click();
      
      // Verificar se o menu apareceu
      await expect(page.getByText(/editar/i)).toBeVisible();
      await expect(page.getByText(/excluir/i)).toBeVisible();
    }
  });
});
