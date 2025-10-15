import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// Configuration de la stratégie Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extraire les informations du profil Google
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;

        if (!email) {
          return done(new Error('Email not provided by Google'), undefined);
        }

        // Chercher l'utilisateur existant par email ou googleId
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { googleId }
            ]
          },
          include: { permissions: true }
        });

        if (user) {
          // Si l'utilisateur existe mais n'a pas de googleId, le mettre à jour
          if (!user.googleId && googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                provider: 'google',
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
              },
              include: { permissions: true }
            });
          }
        } else {
          // Créer un nouveau utilisateur
          user = await prisma.user.create({
            data: {
              email,
              googleId,
              provider: 'google',
              firstName,
              lastName,
              role: 'user',
            },
            include: { permissions: true }
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Error in Google OAuth strategy:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Désérialisation de l'utilisateur depuis la session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { permissions: true }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
