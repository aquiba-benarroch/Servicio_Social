import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { DashboardStat } from '@/components/dashboard-stat';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { toast } from 'sonner';
import { SignOut, Buildings, Users, Calendar, Check, X, Plus, EnvelopeSimple, ChartBar, UsersThree, GearSix, MapPin, PencilSimple } from '@phosphor-icons/react';
import type { UserRole } from '@/lib/types';

interface SuperAdminDashboardProps {
  onNavigate: (page: 'landing' | 'manage-org', orgId?: string) => void;
}

const COMMUNITIES = [
  'Monte Sinai',
  'Maguen David',
  'Tarbut',
  'Otros'
];

export default function SuperAdminDashboard({ onNavigate }: SuperAdminDashboardProps) {
  const { user, logout } = useAuth();
  const { organizations, opportunities, users, addOrganization, updateOrganization, addUser, updateUser } = useData();
  const [showAddOrgDialog, setShowAddOrgDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('volunteer');
  const [newUserCommunity, setNewUserCommunity] = useState('');
  const [customCommunity, setCustomCommunity] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('volunteer');

  const [searchFilter, setSearchFilter] = useState('');
  const [communityFilter, setCommunityFilter] = useState('all');

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para ver esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate('landing')}>
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const handleAddOrganization = () => {
    if (!orgName || !orgEmail || !orgSlug) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const newOrg = {
      id: `org_${Date.now()}`,
      name: orgName,
      contactEmail: orgEmail,
      slug: orgSlug,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    addOrganization(newOrg);
    setShowAddOrgDialog(false);
    setOrgName('');
    setOrgEmail('');
    setOrgSlug('');
    toast.success(`Organización "${orgName}" agregada exitosamente`);
  };

  const handleApproveOrg = (orgId: string) => {
    updateOrganization(orgId, { 
      status: 'approved',
      approvedAt: new Date().toISOString() 
    });
    toast.success('Organización aprobada');
  };

  const handleRejectOrg = (orgId: string) => {
    updateOrganization(orgId, { status: 'rejected' });
    toast.success('Organización rechazada');
  };

  const handleInviteAdmin = () => {
    if (!inviteEmail || !selectedOrgId || !adminPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const org = organizations?.find(o => o.id === selectedOrgId);
    if (!org) {
      toast.error('Organización no encontrada');
      return;
    }

    const newAdmin = {
      id: `orgadmin_${Date.now()}`,
      email: inviteEmail,
      password: adminPassword,
      role: 'org_admin' as const,
      organizationId: selectedOrgId,
      createdAt: new Date().toISOString(),
    };

    addUser(newAdmin);
    setShowInviteDialog(false);
    setInviteEmail('');
    setAdminPassword('');
    setSelectedOrgId(null);
    toast.success(`Administrador creado para ${org.name}. Credenciales: ${inviteEmail} / ${adminPassword}`);
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.error('Por favor completa nombre, correo y contraseña');
      return;
    }

    if (newUserRole === 'volunteer' && newUserCommunity === 'Otros' && !customCommunity.trim()) {
      toast.error('Por favor especifica la comunidad');
      return;
    }

    const existingUser = (users || []).find(u => u.email.toLowerCase() === newUserEmail.toLowerCase());
    if (existingUser) {
      toast.error('Ya existe un usuario con ese correo electrónico');
      return;
    }

    const finalCommunity = newUserRole === 'volunteer' && newUserCommunity
      ? (newUserCommunity === 'Otros' ? customCommunity : newUserCommunity)
      : undefined;

    const newUser = {
      id: `user_${Date.now()}`,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      name: newUserName,
      lastName: newUserLastName || undefined,
      community: finalCommunity,
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);
    setShowAddUserDialog(false);
    setNewUserName('');
    setNewUserLastName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('volunteer');
    setNewUserCommunity('');
    setCustomCommunity('');
    toast.success(`Usuario ${newUserName} creado exitosamente como ${getRoleLabel(newUserRole)}`);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    updateUser(selectedUser.id, { role: editUserRole });
    setShowEditUserDialog(false);
    setSelectedUser(null);
    toast.success(`Rol de usuario actualizado a ${getRoleLabel(editUserRole)}`);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador';
      case 'org_admin':
        return 'Administrador de Organización';
      case 'volunteer':
        return 'Voluntario';
      default:
        return role;
    }
  };

  const pendingOrgs = (organizations || []).filter(o => o.status === 'pending');
  const approvedOrgs = (organizations || []).filter(o => o.status === 'approved');
  const totalOpportunities = (opportunities || []).length;
  const totalVolunteers = (users || []).filter(u => u.role === 'volunteer').length;
  const totalOrgAdmins = (users || []).filter(u => u.role === 'org_admin').length;
  const totalSuperAdmins = (users || []).filter(u => u.role === 'super_admin').length;

  const allCommunities = Array.from(
    new Set(
      (users || [])
        .filter(u => u.role === 'volunteer' && u.community)
        .map(u => u.community)
    )
  ).sort();

  const filteredUsers = (users || []).filter(u => {
    const matchesSearch = searchFilter.trim() === '' || 
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(searchFilter.toLowerCase()));
    
    const matchesCommunity = communityFilter === 'all' || 
      (u.role === 'volunteer' && u.community === communityFilter);
    
    return matchesSearch && matchesCommunity;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-destructive text-destructive-foreground">Super Admin</Badge>;
      case 'org_admin':
        return <Badge className="bg-primary text-primary-foreground">Administrador Org.</Badge>;
      case 'volunteer':
        return <Badge className="bg-success text-success-foreground">Voluntario</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <ChartBar size={24} className="text-primary-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Panel de Super Administrador
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <SignOut size={20} />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bienvenido, Administrador</h2>
          <p className="text-muted-foreground">Gestiona organizaciones, monitorea actividad y supervisa la plataforma completa.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <DashboardStat
                label="Total Organizaciones"
                value={(organizations || []).length}
                icon={<Buildings weight="duotone" size={32} className="text-primary" />}
                description={`${approvedOrgs.length} aprobadas, ${pendingOrgs.length} pendientes`}
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardContent className="pt-6">
              <DashboardStat
                label="Pendientes"
                value={pendingOrgs.length}
                icon={<Buildings weight="duotone" size={32} className="text-secondary" />}
                description="Requieren aprobación"
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="pt-6">
              <DashboardStat
                label="Oportunidades"
                value={totalOpportunities}
                icon={<Calendar weight="duotone" size={32} className="text-accent" />}
                description="En toda la plataforma"
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-success/20 bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="pt-6">
              <DashboardStat
                label="Voluntarios"
                value={totalVolunteers}
                icon={<UsersThree weight="duotone" size={32} className="text-success" />}
                description="Usuarios activos"
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm p-1">
            <TabsTrigger value="organizations" className="gap-2">
              <Buildings size={18} />
              Organizaciones ({(organizations || []).length})
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users size={18} />
              Usuarios ({(users || []).length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Check size={18} />
              Pendientes ({pendingOrgs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Gestión de Organizaciones</h3>
                <p className="text-sm text-muted-foreground">Administra todas las organizaciones registradas en la plataforma</p>
              </div>
              <Button onClick={() => setShowAddOrgDialog(true)} className="gap-2 shadow-lg">
                <Plus size={20} />
                Agregar Organización
              </Button>
            </div>

            {(organizations || []).length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Buildings size={48} className="text-muted-foreground" />}
                    title="Aún no hay organizaciones"
                    description="Comienza agregando la primera organización a la plataforma"
                    action={
                      <Button onClick={() => setShowAddOrgDialog(true)} size="lg" className="gap-2">
                        <Plus size={20} />
                        Agregar Primera Organización
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Nombre de Organización</TableHead>
                      <TableHead className="font-semibold">Correo de Contacto</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Fecha de Creación</TableHead>
                      <TableHead className="text-right font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(organizations || []).map(org => (
                      <TableRow key={org.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>{org.contactEmail}</TableCell>
                        <TableCell>
                          <StatusBadge status={org.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(org.createdAt).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => onNavigate('manage-org', org.id)}
                            >
                              <GearSix size={16} />
                              Administrar
                            </Button>
                            {org.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="gap-1 bg-success hover:bg-success/90"
                                  onClick={() => handleApproveOrg(org.id)}
                                >
                                  <Check size={16} />
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1"
                                  onClick={() => handleRejectOrg(org.id)}
                                >
                                  <X size={16} />
                                  Rechazar
                                </Button>
                              </>
                            )}
                            {org.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => {
                                  setSelectedOrgId(org.id);
                                  setShowInviteDialog(true);
                                }}
                              >
                                <EnvelopeSimple size={16} />
                                Crear Admin
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Todos los Usuarios</h3>
                <p className="text-sm text-muted-foreground">
                  {totalVolunteers} Voluntarios • {totalOrgAdmins} Admins de Org. • {totalSuperAdmins} Super Admins
                </p>
              </div>
              <Button onClick={() => setShowAddUserDialog(true)} className="gap-2 shadow-lg">
                <Plus size={20} />
                Agregar Usuario
              </Button>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-filter">Buscar por Nombre o Correo</Label>
                    <Input
                      id="search-filter"
                      type="text"
                      placeholder="Buscar usuario..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="community-filter">Filtrar por Comunidad</Label>
                    <Select value={communityFilter} onValueChange={setCommunityFilter}>
                      <SelectTrigger id="community-filter">
                        <SelectValue placeholder="Todas las comunidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las comunidades</SelectItem>
                        {allCommunities.map((community) => (
                          <SelectItem key={community} value={community || ''}>
                            {community}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(searchFilter || communityFilter !== 'all') && (
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {filteredUsers.length} de {(users || []).length} usuarios
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchFilter('');
                        setCommunityFilter('all');
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {(users || []).length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Users size={48} className="text-muted-foreground" />}
                    title="No hay usuarios registrados"
                    description="Los usuarios aparecerán aquí cuando se registren"
                    action={
                      <Button onClick={() => setShowAddUserDialog(true)} size="lg" className="gap-2">
                        <Plus size={20} />
                        Agregar Primer Usuario
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Nombre</TableHead>
                      <TableHead className="font-semibold">Correo</TableHead>
                      <TableHead className="font-semibold">Rol</TableHead>
                      <TableHead className="font-semibold">Comunidad/Organización</TableHead>
                      <TableHead className="font-semibold">Fecha de Registro</TableHead>
                      <TableHead className="text-right font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => {
                      const userOrg = u.organizationId 
                        ? (organizations || []).find(org => org.id === u.organizationId)
                        : null;
                      
                      return (
                        <TableRow key={u.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {u.name && u.lastName 
                              ? `${u.name} ${u.lastName}` 
                              : u.name || 'Sin nombre'}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{getRoleBadge(u.role)}</TableCell>
                          <TableCell>
                            {u.role === 'volunteer' && u.community ? (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin size={14} className="text-muted-foreground" />
                                {u.community}
                              </div>
                            ) : u.role === 'org_admin' && userOrg ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Buildings size={14} className="text-muted-foreground" />
                                {userOrg.name}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(u.createdAt).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setSelectedUser(u);
                                setEditUserRole(u.role);
                                setShowEditUserDialog(true);
                              }}
                            >
                              <PencilSimple size={16} />
                              Cambiar Rol
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingOrgs.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Check size={48} className="text-muted-foreground" />}
                    title="No hay organizaciones pendientes"
                    description="Todas las organizaciones han sido revisadas"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-secondary/30">
                <CardHeader>
                  <CardTitle>Organizaciones Pendientes de Aprobación</CardTitle>
                  <CardDescription>Estas organizaciones están esperando tu revisión</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nombre</TableHead>
                        <TableHead className="font-semibold">Correo</TableHead>
                        <TableHead className="font-semibold">Fecha</TableHead>
                        <TableHead className="text-right font-semibold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrgs.map(org => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>{org.contactEmail}</TableCell>
                          <TableCell>{new Date(org.createdAt).toLocaleDateString('es-MX')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="gap-1 bg-success hover:bg-success/90"
                                onClick={() => handleApproveOrg(org.id)}
                              >
                                <Check size={16} />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                                onClick={() => handleRejectOrg(org.id)}
                              >
                                <X size={16} />
                                Rechazar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedOrgs.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Buildings size={48} className="text-muted-foreground" />}
                    title="No hay organizaciones aprobadas"
                    description="Aprueba organizaciones para que puedan comenzar a crear oportunidades"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-success/30">
                <CardHeader>
                  <CardTitle>Organizaciones Aprobadas</CardTitle>
                  <CardDescription>Organizaciones activas en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nombre</TableHead>
                        <TableHead className="font-semibold">Correo</TableHead>
                        <TableHead className="font-semibold">Aprobada</TableHead>
                        <TableHead className="text-right font-semibold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedOrgs.map(org => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>{org.contactEmail}</TableCell>
                          <TableCell>
                            {org.approvedAt ? new Date(org.approvedAt).toLocaleDateString('es-MX') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setSelectedOrgId(org.id);
                                setShowInviteDialog(true);
                              }}
                            >
                              <EnvelopeSimple size={16} />
                              Crear Administrador
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showAddOrgDialog} onOpenChange={setShowAddOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Organización</DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta de organización. Podrás crear administradores después de la aprobación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nombre de la Organización *</Label>
              <Input
                id="org-name"
                placeholder="Ayudantes Comunitarios"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-email">Correo de Contacto *</Label>
              <Input
                id="org-email"
                type="email"
                placeholder="contacto@org.com"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug *</Label>
              <Input
                id="org-slug"
                placeholder="ayudantes-comunitarios"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddOrgDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddOrganization} className="flex-1">
                Agregar Organización
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Administrador de Organización</DialogTitle>
            <DialogDescription>
              Crea un nuevo administrador para esta organización con usuario y contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Correo del Administrador *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="admin@org.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña *</Label>
              <Input
                id="admin-password"
                type="text"
                placeholder="Contraseña para el administrador"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Guarda estas credenciales y compártelas de forma segura con el administrador.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleInviteAdmin} className="flex-1">
                <EnvelopeSimple className="mr-2" size={20} />
                Crear Administrador
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario en la plataforma con el rol que especifiques.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Nombre *</Label>
                <Input
                  id="new-user-name"
                  placeholder="Juan"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-lastname">Apellido</Label>
                <Input
                  id="new-user-lastname"
                  placeholder="Pérez"
                  value={newUserLastName}
                  onChange={(e) => setNewUserLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-email">Correo Electrónico *</Label>
              <Input
                id="new-user-email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password">Contraseña *</Label>
              <Input
                id="new-user-password"
                type="text"
                placeholder="Contraseña para el usuario"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-role">Rol *</Label>
              <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole)}>
                <SelectTrigger id="new-user-role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Voluntario</SelectItem>
                  <SelectItem value="super_admin">Super Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Los administradores de organización se crean desde la sección de organizaciones.
              </p>
            </div>
            {newUserRole === 'volunteer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-user-community">Comunidad</Label>
                  <Select value={newUserCommunity} onValueChange={setNewUserCommunity}>
                    <SelectTrigger id="new-user-community">
                      <SelectValue placeholder="Selecciona una comunidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNITIES.map((community) => (
                        <SelectItem key={community} value={community}>
                          {community}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newUserCommunity === 'Otros' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-community">Especifica la comunidad *</Label>
                    <Input
                      id="custom-community"
                      placeholder="Nombre de la comunidad"
                      value={customCommunity}
                      onChange={(e) => setCustomCommunity(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddUserDialog(false);
                  setNewUserName('');
                  setNewUserLastName('');
                  setNewUserEmail('');
                  setNewUserPassword('');
                  setNewUserRole('volunteer');
                  setNewUserCommunity('');
                  setCustomCommunity('');
                }} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddUser} className="flex-1 gap-2">
                <Plus size={20} />
                Crear Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Modifica el rol de {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-1">
              <p className="text-sm font-medium">Usuario</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              <p className="text-xs text-muted-foreground mt-2">Rol actual: {selectedUser && getRoleLabel(selectedUser.role)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-role">Nuevo Rol *</Label>
              <Select value={editUserRole} onValueChange={(value) => setEditUserRole(value as UserRole)}>
                <SelectTrigger id="edit-user-role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Voluntario</SelectItem>
                  <SelectItem value="super_admin">Super Administrador</SelectItem>
                  <SelectItem value="org_admin">Administrador de Organización</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cambiar el rol afectará los permisos y acceso del usuario en la plataforma.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditUserDialog(false);
                  setSelectedUser(null);
                }} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleEditUser} className="flex-1 gap-2">
                <PencilSimple size={20} />
                Actualizar Rol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
