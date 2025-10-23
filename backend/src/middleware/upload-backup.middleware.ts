import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Dossier temporaire pour les uploads de backup
const BACKUP_UPLOAD_DIR = path.join(__dirname, '../../uploads/temp');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(BACKUP_UPLOAD_DIR)) {
  fs.mkdirSync(BACKUP_UPLOAD_DIR, { recursive: true });
}

// Configuration du storage pour les backups
const backupStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, BACKUP_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `backup-upload-${uniqueSuffix}${ext}`);
  },
});

// Filtre pour accepter uniquement les fichiers JSON
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/json', 'text/plain']; // text/plain pour les .json parfois détectés ainsi
  const allowedExts = ['.json'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers JSON sont acceptés'));
  }
};

export const uploadBackup = multer({
  storage: backupStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});
