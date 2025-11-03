import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers } from '@/services/userService';
import { getAllPermissions } from '@/services/permissionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, ShieldCheck, UserPlus, Loader2, Lock } from 'lucide-react';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalPermissions: 0 });
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Récupérer les permissions de l'utilisateur connecté
        const userPerms = user?.permissions || [];
        setUserPermissions(userPerms);
        
        // Vérifier les permissions et charger les données correspondantes
        const promises: Promise<any>[] = [];
        
        // Charger les utilisateurs seulement si l'utilisateur a la permission
        if (userPerms.includes('read:users')) {
          promises.push(getAllUsers());
        } else {
          promises.push(Promise.resolve([]));
        }
        
        // Charger les permissions seulement si l'utilisateur a la permission
        if (userPerms.includes('read:permissions')) {
          promises.push(getAllPermissions());
        } else {
          promises.push(Promise.resolve([]));
        }
        
        const [usersData, permissionsData] = await Promise.all(promises);
        
        setStats({
          totalUsers: usersData.length,
          totalPermissions: permissionsData.length,
        });
      } catch (err) {
        console.error('Erreur Dashboard:', err);
        setUserPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.permissions]);

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

      {/* Message si aucune permission */}
      {!loading && userPermissions.length === 0 && (
        <Card className="border-muted">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Accès Limité</CardTitle>
            <CardDescription className="mt-2">
              Votre compte n'a pas encore de permissions spécifiques assignées.
              <br />
              Contactez un administrateur pour obtenir l'accès aux fonctionnalités.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Section Statistiques - Afficher selon les permissions */}
      {!loading && userPermissions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Statistiques Clés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte Utilisateurs - seulement si permission read:users */}
            {userPermissions.includes('read:users') && (
              <StatCard 
                title="Utilisateurs Actifs"
                value={stats.totalUsers}
                icon={Users}
                description="Total des utilisateurs enregistrés"
                isLoading={loading}
              />
            )}
            
            {/* Carte Permissions - seulement si permission read:permissions */}
            {userPermissions.includes('read:permissions') && (
              <StatCard 
                title="Permissions Définies"
                value={stats.totalPermissions}
                icon={ShieldCheck}
                description="Total des permissions créées"
                isLoading={loading}
              />
            )}
            
            {/* Message si aucune statistique disponible */}
            {userPermissions.length > 0 && 
             !userPermissions.includes('read:users') && 
             !userPermissions.includes('read:permissions') && (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Votre rôle vous donne l'accès mais aucune statistique n'est disponible avec vos permissions actuelles.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Section Actions Rapides - Afficher selon les permissions */}
      {!loading && userPermissions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Action Gérer les Utilisateurs - seulement si permission read:users */}
            {userPermissions.includes('read:users') && (
              <ActionCard 
                title="Gérer les Utilisateurs"
                description="Consultez la liste des utilisateurs, modifiez leurs informations ou ajoutez-en de nouveaux."
                buttonText="Voir les Utilisateurs"
                buttonIcon={Users}
                onClick={() => navigate('/users')}
              />
            )}
            
            {/* Action Gérer les Permissions - seulement si permission read:permissions */}
            {userPermissions.includes('read:permissions') && (
              <ActionCard 
                title="Gérer les Permissions"
                description="Définissez et organisez les permissions pour contrôler l'accès aux fonctionnalités."
                buttonText="Voir les Permissions"
                buttonIcon={ShieldCheck}
                onClick={() => navigate('/permissions')}
              />
            )}
            
            {/* Action Ajouter un Utilisateur - seulement si permission create:users */}
            {userPermissions.includes('create:users') && (
              <ActionCard 
                title="Ajouter un Utilisateur"
                description="Créez rapidement un nouveau profil utilisateur avec un rôle assigné."
                buttonText="Créer un Utilisateur"
                buttonIcon={UserPlus}
                onClick={() => navigate('/users', { state: { openCreateSheet: true } })}
              />
            )}
            
            {/* Message si aucune action rapide disponible */}
            {userPermissions.length > 0 && 
             !userPermissions.includes('read:users') && 
             !userPermissions.includes('read:permissions') && 
             !userPermissions.includes('create:users') && (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune action rapide disponible avec vos permissions actuelles.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
