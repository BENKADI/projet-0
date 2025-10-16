import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le token ou l'erreur de l'URL
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (token) {
      try {
        // Stocker le token via le contexte d'authentification
        setToken(token);
        
        // Rediriger vers le dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } catch (err) {
        console.error('Erreur lors du stockage du token:', err);
        setError('Erreur lors de l\'authentification. Veuillez réessayer.');
      }
    } else if (errorParam) {
      // Gérer les différents types d'erreurs
      const errorMessages: Record<string, string> = {
        'auth_failed': 'L\'authentification Google a échoué. Veuillez réessayer.',
        'token_generation_failed': 'Erreur lors de la génération du token. Veuillez réessayer.',
        'authentication_failed': 'L\'authentification a échoué. Veuillez réessayer.',
      };

      setError(errorMessages[errorParam] || 'Une erreur s\'est produite. Veuillez réessayer.');
      
      // Rediriger vers la page de login après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      // Ni token ni erreur - quelque chose ne va pas
      setError('Paramètres d\'authentification manquants.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [searchParams, navigate, setToken]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur d'authentification</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <p className="text-center text-sm text-muted-foreground">
                Redirection vers la page de connexion...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Authentification en cours...</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Veuillez patienter pendant que nous vous connectons.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
