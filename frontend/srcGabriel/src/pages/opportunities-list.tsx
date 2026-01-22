import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { useData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Calendar, MapPin, Users, MagnifyingGlass, SignOut } from '@phosphor-icons/react';
import { format } from 'date-fns';

interface OpportunitiesListPageProps {
  onNavigate: (page: 'landing' | 'opportunity-detail' | 'login' | 'volunteer', opportunityId?: string) => void;
}

export default function OpportunitiesListPage({ onNavigate }: OpportunitiesListPageProps) {
  const { getPublishedOpportunities, getOrganizationById } = useData();
  const { isAuthenticated, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  const opportunities = getPublishedOpportunities();

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || opp.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const locations = Array.from(new Set(opportunities.map(opp => opp.location)));

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('landing')}>
              <ArrowLeft className="mr-2" size={20} />
              Volver
            </Button>
            <h1 className="text-2xl font-semibold">Oportunidades de Voluntariado</h1>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="default" onClick={() => onNavigate('volunteer')}>
                  Mi Panel
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <SignOut className="mr-2" size={20} />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button onClick={() => onNavigate('login')}>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Buscar oportunidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filtrar por ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Ubicaciones</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredOpportunities.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="No se encontraron oportunidades"
            description="Intenta ajustar tus criterios de búsqueda o filtros"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map(opp => {
              const org = getOrganizationById(opp.organizationId);
              return (
                <Card key={opp.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onNavigate('opportunity-detail', opp.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">{org?.name || 'Organización Desconocida'}</p>
                        <CardTitle className="text-xl leading-tight">{opp.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {opp.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={16} />
                      <span>{format(new Date(opp.dateStart), 'd MMM yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={16} />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-primary" />
                      <span className="font-medium text-primary">
                        {opp.remainingSlots} {opp.remainingSlots === 1 ? 'lugar disponible' : 'lugares disponibles'}
                      </span>
                    </div>
                    <Button className="w-full mt-4">
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
