import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `dev-backup-${timestamp}.db`);

console.log(`Creating backup of ${DB_PATH} to ${backupFile}...`);

// Simple file copy for SQLite
// For production databases (Postgres/MySQL), use pg_dump or mysqldump via exec()
fs.copyFile(DB_PATH, backupFile, (err) => {
  if (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  } else {
    console.log('Backup completed successfully.');
    
    // Optional: Keep only last 5 backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => path.join(BACKUP_DIR, f))
      .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());

    if (files.length > 5) {
      files.slice(5).forEach(f => {
        fs.unlinkSync(f);
        console.log(`Deleted old backup: ${f}`);
      });
    }
  }
});
