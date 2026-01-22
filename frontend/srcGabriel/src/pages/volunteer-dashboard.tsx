import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { DashboardStat } from '@/components/dashboard-stat';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { SignOut, Calendar, MapPin, Heart, CalendarCheck, Sparkle, MagnifyingGlass } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VolunteerDashboardProps {
  onNavigate: (page: 'landing' | 'opportunities') => void;
}

export default function VolunteerDashboard({ onNavigate }: VolunteerDashboardProps) {
  const { user, logout } = useAuth();
  const { getSignupsByVolunteer, opportunities, getOrganizationById } = useData();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Inicia Sesión</CardTitle>
            <CardDescription>Necesitas iniciar sesión para ver esta página.</CardDescription>
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

  const mySignups = getSignupsByVolunteer(user.id);
  const now = new Date();
  const upcomingSignups = mySignups.filter(signup => {
    const opp = opportunities?.find(o => o.id === signup.opportunityId);
    return opp && new Date(opp.dateEnd) >= now && signup.status !== 'cancelled';
  });
  const pastSignups = mySignups.filter(signup => {
    const opp = opportunities?.find(o => o.id === signup.opportunityId);
    return opp && new Date(opp.dateEnd) < now;
  });

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <header className="border-b-2 border-accent/20 bg-card/95 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-accent via-primary to-secondary rounded-full flex items-center justify-center shadow-xl animate-pulse-slow">
                <Heart size={28} className="text-background" weight="fill" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mi Panel de Voluntario</h1>
                <p className="text-sm text-muted-foreground">✉️ {user.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="default" onClick={() => onNavigate('opportunities')} className="gap-2 shadow-lg">
                <MagnifyingGlass size={20} />
                Explorar Oportunidades
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 border-2">
                <SignOut size={20} />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta! 👋</h2>
          <p className="text-muted-foreground">Revisa tus actividades de voluntariado y descubre nuevas oportunidades para ayudar.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-card shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <DashboardStat
                label="Total de Inscripciones"
                value={mySignups.length}
                icon={<Heart weight="fill" size={32} className="text-accent" />}
                description="Tu impacto hasta ahora"
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-card shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <DashboardStat
                label="Próximas Actividades"
                value={upcomingSignups.length}
                icon={<Calendar weight="duotone" size={32} className="text-primary" />}
                description="Oportunidades activas"
              />
            </CardContent>
          </Card>
          <Card className="border-2 border-success/30 bg-gradient-to-br from-success/10 to-card shadow-lg hover:shadow-xl transition-all">
            <CardContent className="pt-6">
              <DashboardStat
                label="Completadas"
                value={mySignups.filter(s => s.status === 'attended').length}
                icon={<CalendarCheck weight="fill" size={32} className="text-success" />}
                description="Eventos a los que asististe"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Sparkle size={20} className="text-primary-foreground" weight="fill" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Próximas Oportunidades</h2>
                <p className="text-sm text-muted-foreground">Tus actividades de voluntariado programadas</p>
              </div>
            </div>
            {upcomingSignups.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-16">
                  <EmptyState
                    icon={<Calendar size={56} className="text-muted-foreground" />}
                    title="No tienes actividades próximas"
                    description="Explora las oportunidades disponibles y encuentra algo que te apasione"
                    action={
                      <Button onClick={() => onNavigate('opportunities')} size="lg" className="gap-2">
                        <MagnifyingGlass size={22} />
                        Explorar Oportunidades
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSignups.map(signup => {
                  const opp = opportunities?.find(o => o.id === signup.opportunityId);
                  const org = opp ? getOrganizationById(opp.organizationId) : null;
                  
                  if (!opp) return null;
                  
                  return (
                    <Card key={signup.id} className="border-2 hover:shadow-xl transition-all hover:scale-105 overflow-hidden group">
                      <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{org?.name}</p>
                            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{opp.title}</CardTitle>
                          </div>
                          <StatusBadge status={signup.status} />
                        </div>
                        <CardDescription className="line-clamp-2 text-sm">
                          {opp.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pb-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar size={16} className="text-primary" weight="bold" />
                          </div>
                          <span>{format(new Date(opp.dateStart), "d 'de' MMMM, yyyy", { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                            <MapPin size={16} className="text-accent" weight="bold" />
                          </div>
                          <span className="text-muted-foreground">{opp.location}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {pastSignups.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <CalendarCheck size={20} className="text-muted-foreground" weight="fill" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Actividades Pasadas</h2>
                  <p className="text-sm text-muted-foreground">Tu historial de voluntariado</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastSignups.map(signup => {
                  const opp = opportunities?.find(o => o.id === signup.opportunityId);
                  const org = opp ? getOrganizationById(opp.organizationId) : null;
                  
                  if (!opp) return null;
                  
                  return (
                    <Card key={signup.id} className="border opacity-60 hover:opacity-100 transition-opacity">
                      <div className="h-2 bg-muted" />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">{org?.name}</p>
                            <CardTitle className="text-lg leading-tight">{opp.title}</CardTitle>
                          </div>
                          <StatusBadge status={signup.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={16} />
                          <span>{format(new Date(opp.dateStart), "d 'de' MMMM, yyyy", { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin size={16} />
                          <span>{opp.location}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
