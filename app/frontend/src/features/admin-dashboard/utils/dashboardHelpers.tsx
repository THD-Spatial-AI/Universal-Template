type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface DashboardTab {
  key: 'overview' | 'models' | 'webservices' | 'feedback' | 'users';
  label: string;
  show: boolean;
}

export function getDashboardTabs(t: TranslateFn, canManageUsers: boolean, isExpert: boolean): DashboardTab[] {
  return [
    { label: t('adminDashboard.tabs.overview'), show: true, key: 'overview' },
    { label: t('adminDashboard.tabs.allSimulationModels'), show: canManageUsers, key: 'models' },
    { label: t('adminDashboard.tabs.simulationEngine'), show: true, key: 'webservices' },
    { label: t('adminDashboard.tabs.feedback'), show: isExpert, key: 'feedback' },
    { label: t('adminDashboard.tabs.userManagement'), show: canManageUsers, key: 'users' },
  ];
}
