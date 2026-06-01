import { test, expect } from '@grafana/plugin-e2e';

// Panel IDs in provisioning/dashboards/dashboard.json
// 1 — Adaptive, 74% fill, inflow+outflow active, 18.5°C, 12.3mm rain
// 2 — Side Stats, 25% fill, 22.5°C (above 20°C threshold → hot water + warning)
// 3 — Fill layout, 5% fill (below 10% threshold → low level warning)

test('no data — shows error view', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  await test.step('navigate to panel with no data source', async () => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
    await panelEditPage.datasource.set('-- No data source --');
    await expect(panelEditPage.panel.locator).toContainText('No data');
  });
});

test('adaptive layout — renders tank with correct fill level', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });

  await test.step('navigate to adaptive panel (74% fill)', async () => {
    await gotoPanelEditPage({ dashboard, id: '1' });
  });

  await test.step('tank container is visible', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('level overlay shows 74%', async () => {
    await expect(page.getByTestId('fillmeter-level')).toContainText('74');
  });

  await test.step('temperature displayed in overlay', async () => {
    await expect(page.getByTestId('fillmeter-overlay')).toContainText('18.5°C');
  });
});

test('side-stats layout — shows stats panel with level and temperature', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });

  await test.step('navigate to side-stats panel (25% fill, 22.5°C)', async () => {
    await gotoPanelEditPage({ dashboard, id: '2' });
  });

  await test.step('tank renders', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('level overlay shows 25%', async () => {
    await expect(page.getByTestId('fillmeter-level')).toContainText('25');
  });

  await test.step('high-temp warning visible (22.5°C > 20°C threshold)', async () => {
    await expect(page.getByTestId('fillmeter-warning-temp')).toBeVisible();
  });
});

test('fill layout — low level warning visible when fill below threshold', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });

  await test.step('navigate to fill-layout panel (5% fill)', async () => {
    await gotoPanelEditPage({ dashboard, id: '3' });
  });

  await test.step('tank renders', async () => {
    await expect(page.getByTestId('fillmeter-panel')).toBeVisible({ timeout: 5000 });
  });

  await test.step('low level warning visible (5% ≤ 10% threshold)', async () => {
    await expect(page.getByTestId('fillmeter-warning-low')).toBeVisible();
  });

  await test.step('no high-temp warning (no temperature field)', async () => {
    await expect(page.getByTestId('fillmeter-warning-temp')).not.toBeVisible();
  });
});
