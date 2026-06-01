import { test, expect } from '@grafana/plugin-e2e';

test('no data — shows error view', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

  await test.step('remove data source', async () => {
    await panelEditPage.datasource.set('-- No data source --');
  });

  await test.step('error view is shown', async () => {
    await expect(panelEditPage.panel.locator).toContainText('No data');
  });
});
