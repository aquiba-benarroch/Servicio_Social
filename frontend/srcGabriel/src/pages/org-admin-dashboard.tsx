import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { DashboardStat } from '@/components/dashboard-stat';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { toast } from 'sonner';
import { SignOut, Calendar, Users, Eye, Pencil, Plus, Trash, Check, CalendarPlus, Briefcase, CheckCircle } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrgAdminDashboardProps {
  onNavigate: (page: 'landing') => void;
}

export default function OrgAdminDashboard({ onNavigate }: OrgAdminDashboardProps) {
  const { user, logout } = useAuth();
  const { 
    getOrganizationById, 
    getOpportunitiesByOrg, 
    addOpportunity, 
    updateOpportunity, 
    deleteOpportunity,
    getSignupsByOpportunity,
    updateSignup,
  } = useData();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSignupsDialog, setShowSignupsDialog] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [editingOpp, setEditingOpp] = useState<string | null>(null);
  
  const [oppTitle, setOppTitle] = useState('');
  const [oppDescription, setOppDescription] = useState('');
  const [oppLocation, setOppLocation] = useState('');
  const [oppDateStart, setOppDateStart] = useState('');
  const [oppDateEnd, setOppDateEnd] = useState('');
  const [oppSlots, setOppSlots] = useState('10');

  if (!user || user.role !== 'org_admin') {
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

  const organization = getOrganizationById(user.organizationId || '');
  const opportunities = getOpportunitiesByOrg(user.organizationId || '');

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Organización No Encontrada</CardTitle>
            <CardDescription>Tu cuenta de organización no ha sido configurada correctamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              logout();
              onNavigate('landing');
            }}>
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (organization.status !== 'approved') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Organización Pendiente de Aprobación</CardTitle>
            <CardDescription>
              Tu organización "{organization.name}" está actualmente {organization.status === 'pending' ? 'pendiente' : organization.status === 'rejected' ? 'rechazada' : organization.status}.
              {organization.status === 'pending' && ' Por favor espera la aprobación del administrador.'}
              {organization.status === 'rejected' && ' Por favor contacta al soporte de la plataforma.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              logout();
              onNavigate('landing');
            }}>
              Cerrar Sesión
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

  const resetForm = () => {
    setOppTitle('');
    setOppDescription('');
    setOppLocation('');
    setOppDateStart('');
    setOppDateEnd('');
    setOppSlots('10');
    setEditingOpp(null);
  };

  const handleCreateOpportunity = (isDraft: boolean) => {
    if (!oppTitle || !oppDescription || !oppLocation || !oppDateStart || !oppDateEnd || !oppSlots) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const status: 'draft' | 'published' = isDraft ? 'draft' : 'published';
    
    const newOpp = {
      id: `opp_${Date.now()}`,
      organizationId: organization.id,
      title: oppTitle,
      description: oppDescription,
      location: oppLocation,
      dateStart: oppDateStart,
      dateEnd: oppDateEnd,
      totalSlots: parseInt(oppSlots),
      remainingSlots: parseInt(oppSlots),
      status,
      createdAt: new Date().toISOString(),
      publishedAt: isDraft ? undefined : new Date().toISOString(),
    };

    addOpportunity(newOpp);
    setShowCreateDialog(false);
    resetForm();
    toast.success(isDraft ? 'Borrador guardado exitosamente' : '¡Oportunidad publicada con éxito!');
  };

  const handleUpdateOpportunity = (oppId: string, isDraft: boolean) => {
    if (!oppTitle || !oppDescription || !oppLocation || !oppDateStart || !oppDateEnd || !oppSlots) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    updateOpportunity(oppId, {
      title: oppTitle,
      description: oppDescription,
      location: oppLocation,
      dateStart: oppDateStart,
      dateEnd: oppDateEnd,
      totalSlots: parseInt(oppSlots),
      status: isDraft ? 'draft' : 'published',
      publishedAt: isDraft ? undefined : new Date().toISOString(),
    });

    setShowCreateDialog(false);
    resetForm();
    toast.success('Oportunidad actualizada exitosamente');
  };

  const handleEditClick = (oppId: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (opp) {
      setOppTitle(opp.title);
      setOppDescription(opp.description);
      setOppLocation(opp.location);
      setOppDateStart(opp.dateStart);
      setOppDateEnd(opp.dateEnd);
      setOppSlots(opp.totalSlots.toString());
      setEditingOpp(oppId);
      setShowCreateDialog(true);
    }
  };

  const handleDeleteOpportunity = (oppId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta oportunidad?')) {
      deleteOpportunity(oppId);
      toast.success('Oportunidad eliminada');
    }
  };

  const handleViewSignups = (oppId: string) => {
    setSelectedOppId(oppId);
    setShowSignupsDialog(true);
  };

  const handleMarkAttended = (signupId: string) => {
    updateSignup(signupId, {
      status: 'attended',
      attendedAt: new Date().toISOString(),
    });
    toast.success('Marcado como asistido');
  };

  const draftOpps = opportunities.filter(o => o.status === 'draft');
  const publishedOpps = opportunities.filter(o => o.status === 'published');
  const closedOpps = opportunities.filter(o => o.status === 'closed');
  const totalSignups = opportunities.reduce((sum, opp) => sum + getSignupsByOpportunity(opp.id).length, 0);

  const selectedOpp = opportunities.find(o => o.id === selectedOppId);
  const signupsForSelected = selectedOppId ? getSignupsByOpportunity(selectedOppId) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-accent/10">
      <header className="border-b-2 border-secondary/30 bg-card/90 backdrop-blur-lg shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center shadow-xl border-2 border-secondary/20">
                <Briefcase size={28} className="text-secondary-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{organization.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>👤 {user.email}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 border-2">
              <SignOut size={20} />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Panel de Administración</h2>
          <p className="text-muted-foreground">Gestiona tus oportunidades de voluntariado y supervisa las inscripciones</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-card shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <DashboardStat
                label="Total de Oportunidades"
                value={opportunities.length}
                icon={<Calendar weight="duotone" size={32} className="text-primary" />}
                description={`${publishedOpps.length} publicadas`}
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-card shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <DashboardStat
                label="Borradores"
                value={draftOpps.length}
                icon={<Pencil weight="duotone" size={32} className="text-accent" />}
                description="Sin publicar"
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-card shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <DashboardStat
                label="Inscripciones Totales"
                value={totalSignups}
                icon={<Users weight="duotone" size={32} className="text-secondary" />}
                description="Todas las oportunidades"
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-success/30 bg-gradient-to-br from-success/5 to-card shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <DashboardStat
                label="Completas"
                value={closedOpps.length}
                icon={<CheckCircle weight="duotone" size={32} className="text-success" />}
                description="Oportunidades llenas"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Oportunidades</h2>
            <p className="text-sm text-muted-foreground">Crea y administra las oportunidades de voluntariado de tu organización</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }} size="lg" className="gap-2 shadow-lg">
            <Plus size={22} />
            Nueva Oportunidad
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-card/60 backdrop-blur-sm p-1.5 border-2">
            <TabsTrigger value="all" className="gap-2">
              <Calendar size={18} />
              Todas ({opportunities.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              <CheckCircle size={18} />
              Publicadas ({publishedOpps.length})
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-2">
              <Pencil size={18} />
              Borradores ({draftOpps.length})
            </TabsTrigger>
            <TabsTrigger value="closed" className="gap-2">
              <Check size={18} />
              Cerradas ({closedOpps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {opportunities.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-16">
                  <EmptyState
                    icon={<CalendarPlus size={56} className="text-muted-foreground" />}
                    title="Aún no tienes oportunidades"
                    description="Crea tu primera oportunidad de voluntariado para comenzar a recibir inscripciones"
                    action={
                      <Button onClick={() => setShowCreateDialog(true)} size="lg" className="gap-2">
                        <Plus size={22} />
                        Crear Primera Oportunidad
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Título</TableHead>
                      <TableHead className="font-semibold">Ubicación</TableHead>
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="font-semibold">Cupos</TableHead>
                      <TableHead className="font-semibold">Inscritos</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="text-right font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map(opp => {
                      const signups = getSignupsByOpportunity(opp.id);
                      return (
                        <TableRow key={opp.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{opp.title}</TableCell>
                          <TableCell>{opp.location}</TableCell>
                          <TableCell>{format(new Date(opp.dateStart), "d 'de' MMMM, yyyy", { locale: es })}</TableCell>
                          <TableCell>{opp.remainingSlots} / {opp.totalSlots}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              <Users size={14} weight="bold" />
                              {signups.length}
                            </span>
                          </TableCell>
                          <TableCell><StatusBadge status={opp.status} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewSignups(opp.id)}
                                title="Ver inscripciones"
                              >
                                <Eye size={18} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditClick(opp.id)}
                                title="Editar"
                              >
                                <Pencil size={18} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteOpportunity(opp.id)}
                                title="Eliminar"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash size={18} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            <OpportunityList opportunities={publishedOpps} emptyTitle="No hay oportunidades publicadas" emptyDescription="Publica una oportunidad para que los voluntarios puedan inscribirse" />
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            <OpportunityList opportunities={draftOpps} emptyTitle="No hay borradores" emptyDescription="Los borradores te permiten preparar oportunidades antes de publicarlas" />
          </TabsContent>

          <TabsContent value="closed" className="mt-6">
            <OpportunityList opportunities={closedOpps} emptyTitle="No hay oportunidades cerradas" emptyDescription="Las oportunidades se cierran automáticamente cuando se llenan todos los cupos" />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingOpp ? 'Editar Oportunidad' : 'Crear Nueva Oportunidad'}</DialogTitle>
            <DialogDescription>
              Completa los detalles de tu oportunidad de voluntariado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Limpieza de Playa en Santa Mónica"
                value={oppTitle}
                onChange={(e) => setOppTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Únete a nosotros para una jornada de limpieza comunitaria en la playa..."
                value={oppDescription}
                onChange={(e) => setOppDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                placeholder="Playa Santa Mónica, CA"
                value={oppLocation}
                onChange={(e) => setOppLocation(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-start">Fecha de Inicio *</Label>
                <Input
                  id="date-start"
                  type="date"
                  value={oppDateStart}
                  onChange={(e) => setOppDateStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-end">Fecha de Fin *</Label>
                <Input
                  id="date-end"
                  type="date"
                  value={oppDateEnd}
                  onChange={(e) => setOppDateEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slots">Cupos Totales *</Label>
              <Input
                id="slots"
                type="number"
                min="1"
                value={oppSlots}
                onChange={(e) => setOppSlots(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => editingOpp ? handleUpdateOpportunity(editingOpp, true) : handleCreateOpportunity(true)} 
                className="flex-1"
              >
                Guardar como Borrador
              </Button>
              <Button 
                onClick={() => editingOpp ? handleUpdateOpportunity(editingOpp, false) : handleCreateOpportunity(false)} 
                className="flex-1"
              >
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSignupsDialog} onOpenChange={setShowSignupsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Inscripciones para {selectedOpp?.title}</DialogTitle>
            <DialogDescription>
              Gestiona los voluntarios inscritos en esta oportunidad.
            </DialogDescription>
          </DialogHeader>
          {signupsForSelected.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aún no hay inscripciones</p>
            </div>
          ) : (
            <div className="border-2 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Correo</TableHead>
                    <TableHead className="font-semibold">Fecha de Inscripción</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signupsForSelected.map(signup => (
                    <TableRow key={signup.id}>
                      <TableCell className="font-medium">{signup.volunteerName || 'Anónimo'}</TableCell>
                      <TableCell>{signup.volunteerEmail}</TableCell>
                      <TableCell>{format(new Date(signup.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</TableCell>
                      <TableCell><StatusBadge status={signup.status} /></TableCell>
                      <TableCell className="text-right">
                        {signup.status === 'registered' && (
                          <Button
                            size="sm"
                            className="gap-1 bg-success hover:bg-success/90"
                            onClick={() => handleMarkAttended(signup.id)}
                          >
                            <Check size={16} />
                            Marcar Asistencia
                          </Button>
                        )}
                        {signup.status === 'attended' && (
                          <span className="text-sm text-success flex items-center gap-1 justify-end">
                            <CheckCircle size={16} weight="fill" />
                            Asistió
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function OpportunityList({ opportunities, emptyTitle, emptyDescription }: { opportunities: any[], emptyTitle?: string, emptyDescription?: string }) {
    if (opportunities.length === 0) {
      return (
        <Card className="p-12 border-2">
          <div className="text-center">
            <CalendarPlus size={48} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-2">{emptyTitle || 'No hay oportunidades en esta categoría'}</h3>
            <p className="text-sm text-muted-foreground">{emptyDescription || ''}</p>
          </div>
        </Card>
      );
    }
    
    return (
      <Card className="border-2 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Título</TableHead>
              <TableHead className="font-semibold">Ubicación</TableHead>
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold">Cupos</TableHead>
              <TableHead className="font-semibold">Inscritos</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map(opp => {
              const signups = getSignupsByOpportunity(opp.id);
              return (
                <TableRow key={opp.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{opp.title}</TableCell>
                  <TableCell>{opp.location}</TableCell>
                  <TableCell>{format(new Date(opp.dateStart), "d 'de' MMMM, yyyy", { locale: es })}</TableCell>
                  <TableCell>{opp.remainingSlots} / {opp.totalSlots}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Users size={14} weight="bold" />
                      {signups.length}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={opp.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewSignups(opp.id)}
                        title="Ver inscripciones"
                      >
                        <Eye size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(opp.id)}
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteOpportunity(opp.id)}
                        title="Eliminar"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    );
  }
}
