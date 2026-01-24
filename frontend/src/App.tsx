import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

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
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  const navigate = (page: Page, id?: string) => {
    setCurrentPage(page);
    if (page === 'opportunity-detail') {
      setSelectedOpportunityId(id || null);
    }
    if (page === 'manage-org') {
      setSelectedOrganizationId(id || null);
    }
  };

  // Auto-navigate based on authentication
  useEffect(() => {
    if (isAuthenticated && user && currentPage === 'login') {
      if (user.role === 'super_admin') {
        navigate('super-admin');
      } else if (user.role === 'org_admin') {
        navigate('org-admin');
      } else {
        navigate('volunteer');
      }
    }
  }, [isAuthenticated, user, currentPage]);

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={navigate} />}
      {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
      {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
      {currentPage === 'opportunities' && <OpportunitiesListPage onNavigate={navigate} />}
      {currentPage === 'opportunity-detail' && selectedOpportunityId && (
        <OpportunityDetailPage 
          opportunityId={selectedOpportunityId} 
          onNavigate={navigate} 
        />
      )}
      {currentPage === 'super-admin' && <SuperAdminDashboard onNavigate={navigate} />}
      {currentPage === 'org-admin' && <OrgAdminDashboard onNavigate={navigate} />}
      {currentPage === 'volunteer' && <VolunteerDashboard onNavigate={navigate} />}
      {currentPage === 'manage-org' && selectedOrganizationId && (
        <ManageOrganization 
          organizationId={selectedOrganizationId} 
          onNavigate={navigate} 
        />
      )}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
