export type UserRole = 'super_admin' | 'org_admin' | 'volunteer';

export type OrganizationStatus = 'pending' | 'approved' | 'rejected';

export type OpportunityStatus = 'draft' | 'published' | 'closed';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  lastName?: string;
  community?: string;
  organizationId?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  slug: string;
  logo?: string;
  status: OrganizationStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface Opportunity {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  dateStart: string;
  dateEnd: string;
  totalSlots: number;
  remainingSlots: number;
  status: OpportunityStatus;
  createdAt: string;
  publishedAt?: string;
}

export interface Signup {
  id: string;
  opportunityId: string;
  volunteerId: string;
  volunteerEmail: string;
  volunteerName?: string;
  status: 'registered' | 'attended' | 'cancelled';
  createdAt: string;
  attendedAt?: string;
}

export interface MagicLinkRequest {
  email: string;
  role?: UserRole;
  redirectTo?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}
