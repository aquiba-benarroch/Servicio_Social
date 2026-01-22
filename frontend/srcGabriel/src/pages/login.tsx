import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/hooks/use-data';
import { toast } from 'sonner';
import { ArrowLeft, SignIn } from '@phosphor-icons/react';

interface LoginPageProps {
  onNavigate: (page: 'landing' | 'super-admin' | 'org-admin' | 'volunteer' | 'register') => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, validatePassword } = useAuth();
  const { getUserByEmail, addUser } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'super_admin' | 'org_admin' | 'volunteer'>('volunteer');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const existingUser = getUserByEmail(email);
      
      if (!existingUser) {
        toast.error('Este correo no está registrado. Por favor crea una cuenta primero.');
        setLoading(false);
        return;
      }

      if (existingUser.role !== role) {
        toast.error('Por favor selecciona el tipo de inicio de sesión correcto para tu cuenta.');
        setLoading(false);
        return;
      }
      
      if (validatePassword(existingUser.password, password)) {
        const success = login(existingUser, password);
        if (success) {
          toast.success(`¡Has iniciado sesión exitosamente!`);
          setEmail('');
          setPassword('');
          setTimeout(() => {
            if (existingUser.role === 'super_admin') {
              onNavigate('super-admin');
            } else if (existingUser.role === 'org_admin') {
              onNavigate('org-admin');
            } else {
              onNavigate('volunteer');
            }
          }, 500);
        }
      } else {
        toast.error('Contraseña incorrecta. Por favor intenta de nuevo.');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error al iniciar sesión. Por favor intenta de nuevo.');
      setLoading(false);
      return;
    }
    
    setLoading(false);
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
          <Tabs value={role} onValueChange={(v) => setRole(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="volunteer">Voluntario</TabsTrigger>
              <TabsTrigger value="org_admin">Organización</TabsTrigger>
              <TabsTrigger value="super_admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="volunteer">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión como Voluntario</CardTitle>
                  <CardDescription>
                    Ingresa tu correo y contraseña para acceder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="volunteer-email">Correo Electrónico</Label>
                      <Input
                        id="volunteer-email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volunteer-password">Contraseña</Label>
                      <Input
                        id="volunteer-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      <SignIn className="mr-2" size={20} />
                      {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                    <div className="text-center pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        ¿No tienes cuenta?{' '}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto font-semibold"
                          onClick={() => onNavigate('register')}
                        >
                          Regístrate aquí
                        </Button>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="org_admin">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión como Organización</CardTitle>
                  <CardDescription>
                    Solo para administradores de organizaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-email">Correo Electrónico</Label>
                      <Input
                        id="org-email"
                        type="email"
                        placeholder="org@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-password">Contraseña</Label>
                      <Input
                        id="org-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      <SignIn className="mr-2" size={20} />
                      {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="super_admin">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión como Administrador</CardTitle>
                  <CardDescription>
                    Solo para administradores de la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Correo Electrónico</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@leyajad.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Contraseña</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      <SignIn className="mr-2" size={20} />
                      {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground text-center">
                        Credenciales por defecto:<br />
                        Correo: admin@leyajad.com<br />
                        Contraseña: admin123
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
