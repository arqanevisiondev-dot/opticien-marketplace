# 🔧 Solution au Problème MySQL/MariaDB

## ❌ Problème Rencontré

```
Error: Column count of mysql.proc is wrong. Expected 21, found 20.
Created with MariaDB 100108, now running 100432.
```

Ce problème survient quand les tables système MySQL/MariaDB sont corrompues ou incompatibles entre différentes versions.

## ✅ Solutions Possibles

### Option 1: Utiliser SQLite (Recommandé pour le développement)

SQLite est plus simple pour le développement local et ne nécessite aucune installation.

**1. Modifier `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**2. Modifier `.env`:**
```env
DATABASE_URL="file:./prisma/dev.db"
```

**3. Relancer:**
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

### Option 2: Réparer MariaDB (Solution complète)

**1. Arrêter MariaDB:**
```bash
sudo systemctl stop mariadb
# ou pour XAMPP:
sudo /opt/lampp/lampp stopmysql
```

**2. Sauvegarder vos données:**
```bash
mysqldump -u root -h 127.0.0.1 --all-databases > backup.sql
```

**3. Réinstaller MariaDB:**
```bash
sudo apt remove --purge mariadb-server mariadb-client
sudo apt autoremove
sudo apt install mariadb-server mariadb-client
```

**4. Restaurer vos données:**
```bash
mysql -u root < backup.sql
```

### Option 3: Utiliser Docker MySQL (Propre et isolé)

**1. Créer `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: opticien_marketplace
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

**2. Démarrer:**
```bash
docker-compose up -d
```

**3. Utiliser dans `.env`:**
```env
DATABASE_URL="mysql://root:root@127.0.0.1:3306/opticien_marketplace"
```

### Option 4: Ignorer mysql.proc (Workaround temporaire)

Si vous n'utilisez pas de procédures stockées, vous pouvez essayer de contourner le problème:

**1. Supprimer la table proc:**
```bash
mysql -u root -h 127.0.0.1 mysql -e "DROP TABLE IF EXISTS proc;"
```

**2. Créer une table vide compatible:**
```bash
mysql -u root -h 127.0.0.1 mysql << 'EOF'
CREATE TABLE proc (
  db char(64) collate utf8_bin DEFAULT '' NOT NULL,
  name char(64) DEFAULT '' NOT NULL,
  type enum('FUNCTION','PROCEDURE') NOT NULL,
  specific_name char(64) DEFAULT '' NOT NULL,
  language enum('SQL') DEFAULT 'SQL' NOT NULL,
  sql_data_access enum('CONTAINS_SQL','NO_SQL','READS_SQL_DATA','MODIFIES_SQL_DATA') DEFAULT 'CONTAINS_SQL' NOT NULL,
  is_deterministic enum('YES','NO') DEFAULT 'NO' NOT NULL,
  security_type enum('INVOKER','DEFINER') DEFAULT 'DEFINER' NOT NULL,
  param_list blob NOT NULL,
  returns longblob DEFAULT '' NOT NULL,
  body longblob NOT NULL,
  definer char(141) collate utf8_bin DEFAULT '' NOT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  sql_mode set('REAL_AS_FLOAT','PIPES_AS_CONCAT','ANSI_QUOTES','IGNORE_SPACE','ONLY_FULL_GROUP_BY','NO_UNSIGNED_SUBTRACTION','NO_DIR_IN_CREATE','POSTGRESQL','ORACLE','MSSQL','DB2','MAXDB','NO_KEY_OPTIONS','NO_TABLE_OPTIONS','NO_FIELD_OPTIONS','MYSQL323','MYSQL40','ANSI','NO_AUTO_VALUE_ON_ZERO','NO_BACKSLASH_ESCAPES','STRICT_TRANS_TABLES','STRICT_ALL_TABLES','NO_ZERO_IN_DATE','NO_ZERO_DATE','INVALID_DATES','ERROR_FOR_DIVISION_BY_ZERO','TRADITIONAL','NO_AUTO_CREATE_USER','HIGH_NOT_PRECEDENCE','NO_ENGINE_SUBSTITUTION','PAD_CHAR_TO_FULL_LENGTH') DEFAULT '' NOT NULL,
  comment text collate utf8_bin NOT NULL,
  character_set_client char(32) collate utf8_bin,
  collation_connection char(32) collate utf8_bin,
  db_collation char(32) collate utf8_bin,
  body_utf8 longblob,
  aggregate enum('NONE', 'GROUP') DEFAULT 'NONE' NOT NULL,
  PRIMARY KEY (db,name,type)
) engine=MyISAM character set utf8;
EOF
```

## 🎯 Recommandation

Pour le développement local, **utilisez SQLite (Option 1)** - c'est la solution la plus rapide et la plus simple.

Pour la production, vous utiliserez MySQL/PostgreSQL hébergé (PlanetScale, Railway, etc.) qui n'aura pas ces problèmes.

## 📝 Note

Ce problème est spécifique à votre installation locale MariaDB/MySQL et n'affectera pas le déploiement en production.
