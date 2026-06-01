import { test, expect } from '@grafana/plugin-e2e';

test('no data — shows error view', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  // Panel 4 is provisioned with no datasource — immediately shows PanelDataErrorView
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '4' });

  await test.step('error view is shown', async () => {
    await expect(panelEditPage.panel.locator).toContainText('No data');
  });
});
