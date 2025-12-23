# 📦 Backup Local - Hexa Dashboard

Esta pasta contém backups automáticos dos arquivos críticos do sistema.

## 🗂 Estrutura de Backup

Os backups são organizados por data e hora no formato: `Backup_YYYY-MM-DD_HH-mm-ss`.

Cada pasta de backup contém cópias de segurança de:
- `src/`: Código fonte do frontend
- `server/src/`: Código fonte do backend
- `server/prisma/`: Schemas do banco de dados
- Arquivos de configuração (`package.json`, `tsconfig.json`, etc.)
- Exemplos de variáveis de ambiente (`.env.example`)

> **Nota:** As pastas `node_modules` e arquivos `.env` contendo segredos reais **NÃO** são incluídos no backup por questões de segurança e tamanho.

## 🔄 Como Realizar um Novo Backup

Para criar um novo ponto de restauração, execute o script `backup_script.ps1` na raiz do projeto:

```powershell
.\backup_script.ps1
```

## 🛠 Como Restaurar

1. Identifique a pasta de backup desejada (pela data).
2. Copie o conteúdo da pasta de backup.
3. Cole na raiz do projeto, substituindo os arquivos existentes.
4. Execute `npm install` na raiz e na pasta `server` para restaurar as dependências.
