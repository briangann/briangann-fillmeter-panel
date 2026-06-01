// Panel IDs in provisioning/dashboards/dashboard.json
// 1 — Adaptive,   74% fill, 18.5°C, inflow 2.4mm/h (active), rain 12.3mm
// 2 — Side Stats, 25% fill, 22.5°C, no inflow/outflow/rain
import { test, expect } from '@grafana/plugin-e2e';

test('stats bar — shows temperature, rain total, and inflow rate', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '1' });

  await test.step('stats bar is visible', async () => {
    await expect(page.getByTestId('fillmeter-stats-bar')).toBeVisible({ timeout: 5000 });
  });

  await test.step('shows temperature', async () => {
    await expect(page.getByTestId('fillmeter-stats-bar')).toContainText('18.5°C');
  });

  await test.step('shows rain total', async () => {
    await expect(page.getByTestId('fillmeter-stats-bar')).toContainText('12.3 mm');
  });

  await test.step('shows inflow rate', async () => {
    await expect(page.getByTestId('fillmeter-stats-bar')).toContainText('2.4 mm/h');
  });
});

test('side stats panel — shows level, temperature, and outflow status', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '2' });

  await test.step('side stats panel is visible', async () => {
    await expect(page.getByTestId('fillmeter-side-stats')).toBeVisible({ timeout: 5000 });
  });

  await test.step('shows level percentage', async () => {
    await expect(page.getByTestId('fillmeter-side-stats')).toContainText('25%');
  });

  await test.step('shows temperature', async () => {
    await expect(page.getByTestId('fillmeter-side-stats')).toContainText('22.5°C');
  });

  await test.step('shows outflow as Off', async () => {
    await expect(page.getByTestId('fillmeter-side-stats')).toContainText('Off');
  });
});
