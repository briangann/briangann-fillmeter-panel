// Panel IDs in provisioning/dashboards/dashboard.json
// 1 — Adaptive,   74% fill, 18.5°C, inflow+outflow active, 12.3mm rain
// 2 — Side Stats, 25% fill, 22.5°C
// 3 — Fill,        5% fill  (no temperature)
import { test, expect } from '@grafana/plugin-e2e';

test('adaptive layout — renders tank at correct fill level with temperature', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '1' });

  await test.step('tank container is visible', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('level overlay shows 74%', async () => {
    await expect(page.getByTestId('fillmeter-level')).toContainText('74');
  });

  await test.step('temperature shown in overlay', async () => {
    await expect(page.getByTestId('fillmeter-overlay')).toContainText('18.5°C');
  });
});

test('side-stats layout — renders tank with level in overlay', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '2' });

  await test.step('tank container is visible', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('level overlay shows 25%', async () => {
    await expect(page.getByTestId('fillmeter-level')).toContainText('25');
  });
});

test('fill layout — renders tank at low fill level', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '3' });

  await test.step('tank container is visible', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('level overlay shows 5%', async () => {
    await expect(page.getByTestId('fillmeter-level')).toContainText('5');
  });
});
