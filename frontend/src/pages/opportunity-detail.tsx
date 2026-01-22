import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, MapPin, Users, Check, SignOut } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OpportunityDetailPageProps {
  opportunityId: string | null;
  onNavigate: (page: 'opportunities' | 'login' | 'landing') => void;
}

export default function OpportunityDetailPage({ opportunityId, onNavigate }: OpportunityDetailPageProps) {
  const { opportunities, getOrganizationById, addSignup, hasUserSignedUp, addUser } = useData();
  const { user, isAuthenticated, logout } = useAuth();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState(user?.email || '');

  const opportunity = opportunities?.find(opp => opp.id === opportunityId);

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Oportunidad No Encontrada</CardTitle>
            <CardDescription>La oportunidad que buscas no existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate('opportunities')}>
              Volver a Oportunidades
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const org = getOrganizationById(opportunity.organizationId);
  const alreadySignedUp = user ? hasUserSignedUp(opportunity.id, user.id) : false;

  const handleSignupClick = () => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    setShowSignupDialog(true);
  };

  const handleConfirmSignup = () => {
    if (!user) return;

    const signup = {
      id: `signup_${Date.now()}`,
      opportunityId: opportunity.id,
      volunteerId: user.id,
      volunteerEmail: user.email,
      volunteerName: volunteerName || user.name,
      status: 'registered' as const,
      createdAt: new Date().toISOString(),
    };

    addSignup(signup);
    setShowSignupDialog(false);
    toast.success('¡Inscripción exitosa! Se ha enviado confirmación.');
  };

  const handleGuestSignup = () => {
    if (!volunteerEmail) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    const newUser = {
      id: `volunteer_${Date.now()}`,
      email: volunteerEmail,
      password: `temp_${Date.now()}`,
      role: 'volunteer' as const,
      name: volunteerName,
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);

    const signup = {
      id: `signup_${Date.now()}`,
      opportunityId: opportunity.id,
      volunteerId: newUser.id,
      volunteerEmail: volunteerEmail,
      volunteerName: volunteerName,
      status: 'registered' as const,
      createdAt: new Date().toISOString(),
    };

    addSignup(signup);
    setShowSignupDialog(false);
    toast.success(`¡Gracias! Hemos enviado una confirmación a ${volunteerEmail}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => onNavigate('opportunities')}>
            <ArrowLeft className="mr-2" size={20} />
            Volver a Oportunidades
          </Button>
          {isAuthenticated && (
            <Button variant="outline" onClick={handleLogout}>
              <SignOut className="mr-2" size={20} />
              Cerrar Sesión
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-muted-foreground mb-2">{org?.name || 'Organización Desconocida'}</p>
          <h1 className="text-4xl font-semibold mb-4">{opportunity.title}</h1>
          
          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>
                {format(new Date(opportunity.dateStart), 'd MMM yyyy', { locale: es })} - {format(new Date(opportunity.dateEnd), 'd MMM yyyy', { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <span>{opportunity.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <span className="font-medium text-primary">
                {opportunity.remainingSlots} / {opportunity.totalSlots} espacios disponibles
              </span>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sobre Esta Oportunidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">{opportunity.description}</p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          {alreadySignedUp ? (
            <Button size="lg" className="flex-1" disabled>
              <Check className="mr-2" size={20} />
              Ya Inscrito
            </Button>
          ) : opportunity.remainingSlots > 0 ? (
            <Button size="lg" className="flex-1" onClick={handleSignupClick}>
              Inscribirse en Esta Oportunidad
            </Button>
          ) : (
            <Button size="lg" className="flex-1" disabled>
              Oportunidad Llena
            </Button>
          )}
        </div>
      </main>

      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Inscripción</DialogTitle>
            <DialogDescription>
              Por favor confirma tu información para inscribirte en esta oportunidad.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre (Opcional)</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={volunteerName}
                onChange={(e) => setVolunteerName(e.target.value)}
              />
            </div>
            {!isAuthenticated && (
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSignupDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={isAuthenticated ? handleConfirmSignup : handleGuestSignup} className="flex-1">
                Confirmar Inscripción
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
