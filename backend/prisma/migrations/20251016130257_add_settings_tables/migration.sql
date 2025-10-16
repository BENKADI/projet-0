-- CreateTable
CREATE TABLE "app_settings" (
    "id" SERIAL NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'Projet-0',
    "appLanguage" TEXT NOT NULL DEFAULT 'fr',
    "appCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "appLogo" TEXT,
    "appDescription" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "accentColor" TEXT NOT NULL DEFAULT '#8b5cf6',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "browserNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notificationSound" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 3600,
    "passwordPolicy" TEXT NOT NULL DEFAULT 'medium',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "maxUploadSize" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailDigest" TEXT NOT NULL DEFAULT 'daily',
    "sidebarCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");
