import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';

import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import SuperAdminDashboard from '@/pages/super-admin-dashboard';
import OrgAdminDashboard from '@/pages/org-admin-dashboard';
import VolunteerDashboard from '@/pages/volunteer-dashboard';
import OpportunitiesListPage from '@/pages/opportunities-list';
import OpportunityDetailPage from '@/pages/opportunity-detail';
import ManageOrganization from '@/pages/manage-organization';

type Page = 
  | 'landing'
  | 'login'
  | 'register'
  | 'opportunities'
  | 'opportunity-detail'
  | 'super-admin'
  | 'org-admin'
  | 'volunteer'
  | 'manage-org';

function App() {
  const { user, isAuthenticated } = useAuth();
  const { users, addUser } = useData();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if ((users || []).length === 0) {
      const superAdmin = {
        id: 'super_admin_1',
        email: 'admin@leyajad.com',
        password: 'admin123',
        role: 'super_admin' as const,
        name: 'Administrador de Plataforma',
        createdAt: new Date().toISOString(),
      };
      addUser(superAdmin);
    }
  }, [users, addUser]);

  const navigate = (page: Page, id?: string) => {
    setCurrentPage(page);
    if (page === 'opportunity-detail') {
      setSelectedOpportunityId(id || null);
    } else if (page === 'manage-org') {
      setSelectedOrganizationId(id || null);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'opportunities':
        return <OpportunitiesListPage onNavigate={navigate} />;
      case 'opportunity-detail':
        return <OpportunityDetailPage opportunityId={selectedOpportunityId} onNavigate={navigate} />;
      case 'super-admin':
        return <SuperAdminDashboard onNavigate={navigate} />;
      case 'org-admin':
        return <OrgAdminDashboard onNavigate={navigate} />;
      case 'volunteer':
        return <VolunteerDashboard onNavigate={navigate} />;
      case 'manage-org':
        return <ManageOrganization organizationId={selectedOrganizationId || ''} onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  );
}

export default App;
