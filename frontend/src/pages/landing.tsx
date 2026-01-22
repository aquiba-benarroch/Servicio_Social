import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, MapPin, Heart, SignOut } from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';

interface LandingPageProps {
  onNavigate: (page: 'opportunities' | 'login' | 'register' | 'super-admin' | 'org-admin' | 'volunteer') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleGoToDashboard = () => {
    if (user) {
      if (user.role === 'super_admin') {
        onNavigate('super-admin');
      } else if (user.role === 'org_admin') {
        onNavigate('org-admin');
      } else if (user.role === 'volunteer') {
        onNavigate('volunteer');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Heart weight="fill" className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-2xl font-semibold">LeYajad</h1>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="default" onClick={handleGoToDashboard}>
                  Ir a Mi Panel
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <SignOut className="mr-2" size={20} />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" onClick={() => onNavigate('register')}>
                  Crear Cuenta
                </Button>
                <Button variant="outline" onClick={() => onNavigate('login')}>
                  Iniciar Sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <section className="py-20 text-center">
          <h2 className="text-5xl font-semibold mb-6 tracking-tight">
            Conecta. Voluntariado. Marca la Diferencia.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Descubre oportunidades significativas de voluntariado en tu comunidad y ayuda a las organizaciones a generar impacto.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => onNavigate('opportunities')}>
            Explorar Oportunidades
          </Button>
        </section>

        <section className="py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar weight="duotone" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Horarios Flexibles</h3>
                <p className="text-muted-foreground">
                  Encuentra oportunidades que se ajusten a tu horario y disponibilidad.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin weight="duotone" size={32} className="text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Impacto Local</h3>
                <p className="text-muted-foreground">
                  Haz la diferencia en tu vecindario y comunidad local.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Users weight="duotone" size={32} className="text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Únete a una Comunidad</h3>
                <p className="text-muted-foreground">
                  Conéctate con personas de ideas afines que trabajan hacia objetivos comunes.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 LeYajad. Haciendo el voluntariado accesible para todos.</p>
        </div>
      </footer>
    </div>
  );
}
