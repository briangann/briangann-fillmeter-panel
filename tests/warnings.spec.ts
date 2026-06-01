// Panel IDs in provisioning/dashboards/dashboard.json
// 2 — Side Stats, 25% fill, 22.5°C (above 20°C threshold → high-temp warning)
// 3 — Fill,        5% fill  (below 10% threshold → low-level warning, no temp field)
import { test, expect } from '@grafana/plugin-e2e';

test('high-temp warning — visible when temperature exceeds threshold', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '2' });

  await test.step('tank renders', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('high-temp warning icon visible (22.5°C > 20°C threshold)', async () => {
    await expect(page.getByTestId('fillmeter-warning-temp')).toBeVisible();
  });

  await test.step('no low-level warning (25% > 10% threshold)', async () => {
    await expect(page.getByTestId('fillmeter-warning-low')).not.toBeVisible();
  });
});

test('low-level warning — visible when fill is at or below threshold', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  await gotoPanelEditPage({ dashboard, id: '3' });

  await test.step('tank renders', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('low-level warning icon visible (5% ≤ 10% threshold)', async () => {
    await expect(page.getByTestId('fillmeter-warning-low')).toBeVisible();
  });

  await test.step('no high-temp warning (no temperature field)', async () => {
    await expect(page.getByTestId('fillmeter-warning-temp')).not.toBeVisible();
  });
});
