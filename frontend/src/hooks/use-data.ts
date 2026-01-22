// ========================================
// HOOK DE DATOS (VERSIÓN SQL)
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { usersAPI, organizationsAPI, opportunitiesAPI, signupsAPI } from '@/lib/api';
import { Organization, Opportunity, Signup, User } from '@/lib/types';

export function useData() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [usersRes, orgsRes, oppsRes] = await Promise.all([
        usersAPI.getAll().catch(() => ({ data: [] })),
        organizationsAPI.getAll().catch(() => ({ data: [] })),
        opportunitiesAPI.getAll().catch(() => ({ data: [] })),
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (orgsRes.data) setOrganizations(orgsRes.data);
      if (oppsRes.data) setOpportunities(oppsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addUser = useCallback((user: User) => {
    setUsers((current) => [...(current || []), user]);
  }, [setUsers]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers((current) =>
      (current || []).map(user => user.id === id ? { ...user, ...updates } : user)
    );
  }, [setUsers]);

  const getUserByEmail = useCallback((email: string) => {
    return (users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  }, [users]);

  const addOrganization = useCallback((org: Organization) => {
    setOrganizations((current) => [...(current || []), org]);
  }, [setOrganizations]);

  const updateOrganization = useCallback((id: string, updates: Partial<Organization>) => {
    setOrganizations((current) =>
      (current || []).map(org => org.id === id ? { ...org, ...updates } : org)
    );
  }, [setOrganizations]);

  const getOrganizationById = useCallback((id: string) => {
    return (organizations || []).find(org => org.id === id);
  }, [organizations]);

  const addOpportunity = useCallback((opp: Opportunity) => {
    setOpportunities((current) => [...(current || []), opp]);
  }, [setOpportunities]);

  const updateOpportunity = useCallback((id: string, updates: Partial<Opportunity>) => {
    setOpportunities((current) =>
      (current || []).map(opp => opp.id === id ? { ...opp, ...updates } : opp)
    );
  }, [setOpportunities]);

  const deleteOpportunity = useCallback((id: string) => {
    setOpportunities((current) => (current || []).filter(opp => opp.id !== id));
  }, [setOpportunities]);

  const getOpportunitiesByOrg = useCallback((orgId: string) => {
    return (opportunities || []).filter(opp => opp.organizationId === orgId);
  }, [opportunities]);

  const getPublishedOpportunities = useCallback(() => {
    return (opportunities || []).filter(opp => 
      opp.status === 'published' && 
      opp.remainingSlots > 0 &&
      new Date(opp.dateEnd) >= new Date()
    );
  }, [opportunities]);

  const addSignup = useCallback((signup: Signup) => {
    setSignups((current) => [...(current || []), signup]);
    
    setOpportunities((current) =>
      (current || []).map(opp => {
        if (opp.id === signup.opportunityId) {
          const newRemaining = opp.remainingSlots - 1;
          return {
            ...opp,
            remainingSlots: newRemaining,
            status: newRemaining === 0 ? 'closed' : opp.status,
          };
        }
        return opp;
      })
    );
  }, [setSignups, setOpportunities]);

  const updateSignup = useCallback((id: string, updates: Partial<Signup>) => {
    setSignups((current) =>
      (current || []).map(signup => signup.id === id ? { ...signup, ...updates } : signup)
    );
  }, [setSignups]);

  const getSignupsByVolunteer = useCallback((volunteerId: string) => {
    return (signups || []).filter(s => s.volunteerId === volunteerId);
  }, [signups]);

  const getSignupsByOpportunity = useCallback((opportunityId: string) => {
    return (signups || []).filter(s => s.opportunityId === opportunityId);
  }, [signups]);

  const hasUserSignedUp = useCallback((opportunityId: string, volunteerId: string) => {
    return (signups || []).some(s => 
      s.opportunityId === opportunityId && 
      s.volunteerId === volunteerId &&
      s.status !== 'cancelled'
    );
  }, [signups]);

  return {
    users,
    organizations,
    opportunities,
    signups,
    addUser,
    updateUser,
    getUserByEmail,
    addOrganization,
    updateOrganization,
    getOrganizationById,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    getOpportunitiesByOrg,
    getPublishedOpportunities,
    addSignup,
    updateSignup,
    getSignupsByVolunteer,
    getSignupsByOpportunity,
    hasUserSignedUp,
  };
}
