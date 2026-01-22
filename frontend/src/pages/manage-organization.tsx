import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { useData } from '@/hooks/use-data';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Buildings, 
  EnvelopeSimple, 
  Key, 
  Users, 
  Calendar, 
  Trash,
  Pencil,
  Eye,
  EyeSlash,
  Plus,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import type { User } from '@/lib/types';

interface ManageOrganizationProps {
  organizationId: string;
  onNavigate: (page: 'super-admin') => void;
}

export default function ManageOrganization({ organizationId, onNavigate }: ManageOrganizationProps) {
  const { 
    organizations, 
    users, 
    opportunities, 
    updateOrganization, 
    addUser,
    updateOpportunity,
    deleteOpportunity,
    getOpportunitiesByOrg,
    signups
  } = useData();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showEditOppDialog, setShowEditOppDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  
  const [oppTitle, setOppTitle] = useState('');
  const [oppDescription, setOppDescription] = useState('');
  const [oppLocation, setOppLocation] = useState('');
  const [oppDateStart, setOppDateStart] = useState('');
  const [oppDateEnd, setOppDateEnd] = useState('');
  const [oppTotalSlots, setOppTotalSlots] = useState('');
  const [oppStatus, setOppStatus] = useState<'draft' | 'published' | 'closed'>('draft');

  const organization = organizations?.find(o => o.id === organizationId);
  const orgAdmins = (users || []).filter(u => u.organizationId === organizationId && u.role === 'org_admin');
  const orgOpportunities = getOpportunitiesByOrg(organizationId);

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setOrgEmail(organization.contactEmail);
      setOrgSlug(organization.slug);
    }
  }, [organization]);

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Organización no encontrada</CardTitle>
            <CardDescription>No se pudo encontrar la organización solicitada.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate('super-admin')}>
              <ArrowLeft className="mr-2" size={20} />
              Volver al Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateOrganization = () => {
    if (!orgName || !orgEmail || !orgSlug) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    updateOrganization(organizationId, {
      name: orgName,
      contactEmail: orgEmail,
      slug: orgSlug,
    });
    toast.success('Organización actualizada exitosamente');
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const existingUser = (users || []).find(u => u.email === newAdminEmail);
    if (existingUser) {
      toast.error('Ya existe un usuario con ese correo electrónico');
      return;
    }

    const newAdmin: User = {
      id: `orgadmin_${Date.now()}`,
      email: newAdminEmail,
      password: newAdminPassword,
      role: 'org_admin',
      name: newAdminName || undefined,
      organizationId: organizationId,
      createdAt: new Date().toISOString(),
    };

    addUser(newAdmin);
    setShowAddAdminDialog(false);
    setNewAdminEmail('');
    setNewAdminPassword('');
    setNewAdminName('');
    toast.success(`Administrador agregado: ${newAdminEmail} / ${newAdminPassword}`);
  };

  const handleEditOpportunity = () => {
    if (!selectedOppId) return;
    
    const updates: any = {};
    if (oppTitle) updates.title = oppTitle;
    if (oppDescription) updates.description = oppDescription;
    if (oppLocation) updates.location = oppLocation;
    if (oppDateStart) updates.dateStart = oppDateStart;
    if (oppDateEnd) updates.dateEnd = oppDateEnd;
    if (oppTotalSlots) {
      const newTotal = parseInt(oppTotalSlots);
      const opp = opportunities?.find(o => o.id === selectedOppId);
      if (opp) {
        const usedSlots = opp.totalSlots - opp.remainingSlots;
        updates.totalSlots = newTotal;
        updates.remainingSlots = newTotal - usedSlots;
      }
    }
    updates.status = oppStatus;

    updateOpportunity(selectedOppId, updates);
    setShowEditOppDialog(false);
    toast.success('Oportunidad actualizada exitosamente');
    resetOppForm();
  };

  const handleDeleteOpportunity = (oppId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta oportunidad? Esta acción no se puede deshacer.')) {
      deleteOpportunity(oppId);
      toast.success('Oportunidad eliminada');
    }
  };

  const resetOppForm = () => {
    setOppTitle('');
    setOppDescription('');
    setOppLocation('');
    setOppDateStart('');
    setOppDateEnd('');
    setOppTotalSlots('');
    setOppStatus('draft');
    setSelectedOppId(null);
  };

  const openEditOppDialog = (oppId: string) => {
    const opp = opportunities?.find(o => o.id === oppId);
    if (opp) {
      setSelectedOppId(oppId);
      setOppTitle(opp.title);
      setOppDescription(opp.description);
      setOppLocation(opp.location);
      setOppDateStart(opp.dateStart.split('T')[0]);
      setOppDateEnd(opp.dateEnd.split('T')[0]);
      setOppTotalSlots(opp.totalSlots.toString());
      setOppStatus(opp.status);
      setShowEditOppDialog(true);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const getSignupCount = (oppId: string) => {
    return (signups || []).filter(s => s.opportunityId === oppId && s.status !== 'cancelled').length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => onNavigate('super-admin')}>
                <ArrowLeft size={24} />
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Buildings size={24} className="text-primary-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Administrar Organización
                </h1>
                <p className="text-sm text-muted-foreground">{organization.name}</p>
              </div>
            </div>
            <StatusBadge status={organization.status} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm p-1">
            <TabsTrigger value="info" className="gap-2">
              <Buildings size={18} />
              Información
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Users size={18} />
              Administradores ({orgAdmins.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="gap-2">
              <Calendar size={18} />
              Oportunidades ({orgOpportunities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Información de la Organización</CardTitle>
                <CardDescription>Edita los datos principales de la organización</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Nombre de la Organización</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-email">Correo de Contacto</Label>
                    <Input
                      id="org-email"
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-slug">Slug (URL)</Label>
                    <Input
                      id="org-slug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={organization.status === 'approved' ? 'default' : 'outline'}
                        className="flex-1 gap-2"
                        onClick={() => updateOrganization(organizationId, { status: 'approved', approvedAt: new Date().toISOString() })}
                      >
                        <CheckCircle size={18} />
                        Aprobada
                      </Button>
                      <Button
                        variant={organization.status === 'rejected' ? 'destructive' : 'outline'}
                        className="flex-1 gap-2"
                        onClick={() => updateOrganization(organizationId, { status: 'rejected' })}
                      >
                        <XCircle size={18} />
                        Rechazada
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <p>Creada: {new Date(organization.createdAt).toLocaleString('es-MX')}</p>
                    {organization.approvedAt && (
                      <p>Aprobada: {new Date(organization.approvedAt).toLocaleString('es-MX')}</p>
                    )}
                  </div>
                  <Button onClick={handleUpdateOrganization} className="gap-2">
                    <Pencil size={18} />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Administradores de la Organización</h3>
                <p className="text-sm text-muted-foreground">Gestiona los usuarios administradores y sus credenciales</p>
              </div>
              <Button onClick={() => setShowAddAdminDialog(true)} className="gap-2">
                <Plus size={20} />
                Agregar Administrador
              </Button>
            </div>

            {orgAdmins.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Users size={48} className="text-muted-foreground" />}
                    title="No hay administradores"
                    description="Agrega el primer administrador para esta organización"
                    action={
                      <Button onClick={() => setShowAddAdminDialog(true)} className="gap-2">
                        <Plus size={20} />
                        Agregar Primer Administrador
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
                      <TableHead className="font-semibold">Contraseña</TableHead>
                      <TableHead className="font-semibold">Creado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgAdmins.map(admin => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.name || 'Sin nombre'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EnvelopeSimple size={16} className="text-muted-foreground" />
                            {admin.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Key size={16} className="text-muted-foreground" />
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {showPassword[admin.id] ? admin.password : '••••••••'}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(admin.id)}
                            >
                              {showPassword[admin.id] ? <EyeSlash size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(admin.createdAt).toLocaleDateString('es-MX')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Oportunidades de Voluntariado</h3>
                <p className="text-sm text-muted-foreground">Edita y administra las oportunidades creadas por esta organización</p>
              </div>
            </div>

            {orgOpportunities.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Calendar size={48} className="text-muted-foreground" />}
                    title="No hay oportunidades"
                    description="Esta organización aún no ha creado ninguna oportunidad de voluntariado"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orgOpportunities.map(opp => (
                  <Card key={opp.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle>{opp.title}</CardTitle>
                            <StatusBadge status={opp.status} />
                          </div>
                          <CardDescription>{opp.location}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditOppDialog(opp.id)}
                            className="gap-1"
                          >
                            <Pencil size={16} />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteOpportunity(opp.id)}
                            className="gap-1"
                          >
                            <Trash size={16} />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-muted-foreground">Inicio</p>
                            <p>{new Date(opp.dateStart).toLocaleDateString('es-MX')}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-muted-foreground">Fin</p>
                            <p>{new Date(opp.dateEnd).toLocaleDateString('es-MX')}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-muted-foreground">Inscritos</p>
                            <p>{getSignupCount(opp.id)} / {opp.totalSlots}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-muted-foreground">Disponibles</p>
                            <p className="font-bold text-primary">{opp.remainingSlots}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Administrador</DialogTitle>
            <DialogDescription>
              Crea un nuevo administrador para {organization.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nombre (opcional)</Label>
              <Input
                id="admin-name"
                placeholder="Juan Pérez"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Correo Electrónico *</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@organizacion.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña *</Label>
              <Input
                id="admin-password"
                type="text"
                placeholder="Contraseña segura"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Esta contraseña se mostrará una vez creada. Guárdala de forma segura.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddAdminDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddAdmin} className="flex-1">
                Crear Administrador
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditOppDialog} onOpenChange={setShowEditOppDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Oportunidad</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la oportunidad de voluntariado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opp-title">Título</Label>
              <Input
                id="opp-title"
                value={oppTitle}
                onChange={(e) => setOppTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opp-description">Descripción</Label>
              <Textarea
                id="opp-description"
                rows={4}
                value={oppDescription}
                onChange={(e) => setOppDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opp-location">Ubicación</Label>
              <Input
                id="opp-location"
                value={oppLocation}
                onChange={(e) => setOppLocation(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opp-date-start">Fecha de Inicio</Label>
                <Input
                  id="opp-date-start"
                  type="date"
                  value={oppDateStart}
                  onChange={(e) => setOppDateStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opp-date-end">Fecha de Fin</Label>
                <Input
                  id="opp-date-end"
                  type="date"
                  value={oppDateEnd}
                  onChange={(e) => setOppDateEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opp-slots">Total de Espacios</Label>
                <Input
                  id="opp-slots"
                  type="number"
                  min="1"
                  value={oppTotalSlots}
                  onChange={(e) => setOppTotalSlots(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opp-status">Estado</Label>
                <select
                  id="opp-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={oppStatus}
                  onChange={(e) => setOppStatus(e.target.value as any)}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicada</option>
                  <option value="closed">Cerrada</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditOppDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleEditOpportunity} className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
