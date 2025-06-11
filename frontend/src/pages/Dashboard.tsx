import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers } from '@/services/userService';
import { getAllPermissions } from '@/services/permissionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, ShieldCheck, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalPermissions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersData, permissionsData] = await Promise.all([
          getAllUsers(),
          getAllPermissions(),
        ]);
        setStats({
          totalUsers: usersData.length,
          totalPermissions: permissionsData.length,
        });
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques. Les données peuvent être incomplètes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string, value: number, icon: React.ElementType, description: string, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-10 flex items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  const ActionCard = ({ title, description, buttonText, buttonIcon: Icon, onClick }: { title: string, description: string, buttonText: string, buttonIcon: React.ElementType, onClick: () => void }) => (
     <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm min-h-[40px]">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onClick} className="w-full">
            <Icon className="mr-2 h-5 w-5" />
            {buttonText}
          </Button>
        </CardContent>
      </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue, <span className="font-semibold text-primary">{user?.email}</span> ! Voici un aperçu de votre application.
        </p>
      </div>

      {error && (
         <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Erreur de chargement</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {/* Section Statistiques */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Statistiques Clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Utilisateurs Actifs"
            value={stats.totalUsers}
            icon={Users}
            description="Total des utilisateurs enregistrés"
            isLoading={loading}
          />
          <StatCard 
            title="Permissions Définies"
            value={stats.totalPermissions}
            icon={ShieldCheck}
            description="Total des permissions créées"
            isLoading={loading}
          />
        </div>
      </section>

      {/* Section Actions Rapides */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard 
            title="Gérer les Utilisateurs"
            description="Consultez la liste des utilisateurs, modifiez leurs informations ou ajoutez-en de nouveaux."
            buttonText="Voir les Utilisateurs"
            buttonIcon={Users}
            onClick={() => navigate('/users')}
          />
           <ActionCard 
            title="Gérer les Permissions"
            description="Définissez et organisez les permissions pour contrôler l'accès aux fonctionnalités."
            buttonText="Voir les Permissions"
            buttonIcon={ShieldCheck}
            onClick={() => navigate('/permissions')}
          />
          <ActionCard 
            title="Ajouter un Utilisateur"
            description="Créez rapidement un nouveau profil utilisateur avec un rôle assigné."
            buttonText="Créer un Utilisateur"
            buttonIcon={UserPlus}
            onClick={() => navigate('/users', { state: { openCreateSheet: true } })}
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
