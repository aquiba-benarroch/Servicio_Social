import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus } from '@phosphor-icons/react';

interface RegisterPageProps {
  onNavigate: (page: 'landing' | 'login' | 'volunteer') => void;
}

const COMMUNITIES = [
  'Monte Sinai',
  'Maguen David',
  'Tarbut',
  'Otros'
];

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { login } = useAuth();
  const { addUser, getUserByEmail } = useData();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    community: '',
  });
  const [customCommunity, setCustomCommunity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.lastName || !formData.email || !formData.password || !formData.community) {
        toast.error('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      if (formData.community === 'Otros' && !customCommunity.trim()) {
        toast.error('Por favor especifica tu comunidad');
        setLoading(false);
        return;
      }

      const existingUser = getUserByEmail(formData.email);
      if (existingUser) {
        toast.error('Este correo ya está registrado. Por favor inicia sesión.');
        setLoading(false);
        return;
      }

      const finalCommunity = formData.community === 'Otros' ? customCommunity : formData.community;

      const newUser = {
        id: `volunteer_${Date.now()}`,
        email: formData.email,
        password: formData.password,
        role: 'volunteer' as const,
        name: formData.name,
        lastName: formData.lastName,
        community: finalCommunity,
        createdAt: new Date().toISOString(),
      };

      addUser(newUser);
      const success = login(newUser, formData.password);
      
      if (success) {
        toast.success('¡Cuenta creada exitosamente! Bienvenido a LeYajad.');
        setTimeout(() => {
          onNavigate('volunteer');
        }, 500);
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error al crear cuenta. Por favor intenta de nuevo.');
    }
    
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => onNavigate('landing')}>
            <ArrowLeft className="mr-2" size={20} />
            Volver al Inicio
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Crear Cuenta de Voluntario</CardTitle>
              <CardDescription>
                Completa tus datos para unirte a nuestra comunidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Pérez"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community">Comunidad *</Label>
                  <Select value={formData.community} onValueChange={(value) => handleChange('community', value)}>
                    <SelectTrigger id="community">
                      <SelectValue placeholder="Selecciona tu comunidad" />
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

                {formData.community === 'Otros' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-community">Especifica tu comunidad *</Label>
                    <Input
                      id="custom-community"
                      type="text"
                      placeholder="Nombre de tu comunidad"
                      value={customCommunity}
                      onChange={(e) => setCustomCommunity(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <UserPlus className="mr-2" size={20} />
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{' '}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => onNavigate('login')}
                    >
                      Inicia sesión aquí
                    </Button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
