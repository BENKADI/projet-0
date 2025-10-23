import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class SettingsController {
  // ==================== PARAMÈTRES GÉNÉRAUX ====================
  
  /**
   * Récupérer les paramètres généraux de l'application
   */
  async getAppSettings(_req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 GET /settings/app - Récupération des paramètres');
      let settings = await prisma.appSettings.findFirst();
      
      // Si aucun paramètre n'existe, créer les paramètres par défaut
      if (!settings) {
        console.log('⚠️ Aucun paramètre trouvé, création des paramètres par défaut');
        settings = await prisma.appSettings.create({
          data: {}
        });
      }
      console.log('✅ Paramètres récupérés:', settings.appName);
      
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('❌ Erreur getAppSettings:', error);
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la récupération des paramètres' 
      });
    }
  }

  /**
   * Mettre à jour les paramètres généraux
   */
  async updateAppSettings(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 PUT /settings/app - Mise à jour des paramètres');
      console.log('Body reçu:', JSON.stringify(req.body, null, 2));
      
      const {
        appName,
        appLanguage,
        appCurrency,
        appLogo,
        appDescription,
        theme,
        primaryColor,
        accentColor,
        emailNotifications,
        browserNotifications,
        notificationSound,
        twoFactorEnabled,
        sessionTimeout,
        passwordPolicy,
        maintenanceMode,
        allowRegistration,
        maxUploadSize,
      } = req.body;

      // Récupérer les paramètres existants
      let settings = await prisma.appSettings.findFirst();

      if (!settings) {
        // Créer si n'existe pas
        console.log('⚠️ Création des paramètres car inexistants');
        settings = await prisma.appSettings.create({
          data: {
            appName,
            appLanguage,
            appCurrency,
            appLogo,
            appDescription,
            theme,
            primaryColor,
            accentColor,
            emailNotifications,
            browserNotifications,
            notificationSound,
            twoFactorEnabled,
            sessionTimeout,
            passwordPolicy,
            maintenanceMode,
            allowRegistration,
            maxUploadSize,
          },
        });
      } else {
        // Mettre à jour
        console.log('🔄 Mise à jour des paramètres existants (ID:', settings.id, ')');
        settings = await prisma.appSettings.update({
          where: { id: settings.id },
          data: {
            ...(appName !== undefined && { appName }),
            ...(appLanguage !== undefined && { appLanguage }),
            ...(appCurrency !== undefined && { appCurrency }),
            ...(appLogo !== undefined && { appLogo }),
            ...(appDescription !== undefined && { appDescription }),
            ...(theme !== undefined && { theme }),
            ...(primaryColor !== undefined && { primaryColor }),
            ...(accentColor !== undefined && { accentColor }),
            ...(emailNotifications !== undefined && { emailNotifications }),
            ...(browserNotifications !== undefined && { browserNotifications }),
            ...(notificationSound !== undefined && { notificationSound }),
            ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
            ...(sessionTimeout !== undefined && { sessionTimeout }),
            ...(passwordPolicy !== undefined && { passwordPolicy }),
            ...(maintenanceMode !== undefined && { maintenanceMode }),
            ...(allowRegistration !== undefined && { allowRegistration }),
            ...(maxUploadSize !== undefined && { maxUploadSize }),
          },
        });
      }

      console.log('✅ Paramètres enregistrés:', settings.appName);
      res.status(200).json({
        message: 'Paramètres mis à jour avec succès',
        settings,
      });
    } catch (error: any) {
      console.error('❌ Erreur updateAppSettings:', error);
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la mise à jour des paramètres' 
      });
    }
  }

  // ==================== PRÉFÉRENCES UTILISATEUR ====================

  /**
   * Récupérer les préférences d'un utilisateur
   */
  async getUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      let preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      // Si aucune préférence n'existe, créer les préférences par défaut
      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: { userId },
        });
      }

      res.status(200).json(preferences);
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la récupération des préférences' 
      });
    }
  }

  /**
   * Mettre à jour les préférences utilisateur
   */
  async updateUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const {
        theme,
        language,
        emailNotifications,
        pushNotifications,
        emailDigest,
        sidebarCollapsed,
        compactMode,
      } = req.body;

      // Vérifier si les préférences existent
      let preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Créer si n'existe pas
        preferences = await prisma.userPreferences.create({
          data: {
            userId,
            theme,
            language,
            emailNotifications,
            pushNotifications,
            emailDigest,
            sidebarCollapsed,
            compactMode,
          },
        });
      } else {
        // Mettre à jour
        preferences = await prisma.userPreferences.update({
          where: { userId },
          data: {
            ...(theme !== undefined && { theme }),
            ...(language !== undefined && { language }),
            ...(emailNotifications !== undefined && { emailNotifications }),
            ...(pushNotifications !== undefined && { pushNotifications }),
            ...(emailDigest !== undefined && { emailDigest }),
            ...(sidebarCollapsed !== undefined && { sidebarCollapsed }),
            ...(compactMode !== undefined && { compactMode }),
          },
        });
      }

      res.status(200).json({
        message: 'Préférences mises à jour avec succès',
        preferences,
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la mise à jour des préférences' 
      });
    }
  }

  // ==================== UPLOAD LOGO ====================

  /**
   * Upload du logo de l'application
   */
  async uploadLogo(req: Request, res: Response): Promise<void> {
    try {
      console.log('📤 POST /settings/logo - Upload du logo');
      // Utiliser multer: fichier disponible via req.file
      if (!req.file) {
        console.log('❌ Aucun fichier reçu');
        res.status(400).json({ message: 'Aucun fichier envoyé' });
        return;
      }

      const logoUrl = `/uploads/logos/${req.file.filename}`;
      console.log('📁 Logo sauvegardé:', logoUrl);

      // Récupérer ou créer les paramètres
      let settings = await prisma.appSettings.findFirst();
      if (!settings) {
        settings = await prisma.appSettings.create({ data: {} });
      }

      // Supprimer l'ancien logo si existant
      if (settings.appLogo) {
        const relative = settings.appLogo.replace(/^\/+/, '');
        const path = require('path');
        const fs = require('fs');
        const oldPath = path.join(__dirname, '../..', relative);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }

      const updatedSettings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: { appLogo: logoUrl },
      });

      console.log('✅ Logo mis à jour avec succès');
      res.status(200).json({
        message: 'Logo mis à jour avec succès',
        logoUrl: updatedSettings.appLogo,
      });
    } catch (error: any) {
      console.error('❌ Erreur uploadLogo:', error);
      res.status(500).json({ 
        message: error.message || 'Erreur lors de l\'upload du logo' 
      });
    }
  }
}

export default new SettingsController();
