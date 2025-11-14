# 🐳 Docker Setup - AutoConnect

## Services

- **PostgreSQL 15** : Base de données principale
  - Port : `5432`
  - Database : `db_autoconnect`
  - User : `autoconnect_user`
  - Password : `autoconnect`

- **Redis 7** : Cache et file de tâches (Celery)
  - Port : `6379`

## Commandes

### Démarrer les services
```bash
docker-compose up -d
```

### Arrêter les services
```bash
docker-compose stop
```

### Voir les logs
```bash
docker-compose logs -f
```

### Redémarrer
```bash
docker-compose restart
```

### Supprimer tout (⚠️ EFFACE LES DONNÉES)
```bash
docker-compose down -v
```

## Accès direct

### PostgreSQL
```bash
docker exec -it autoconnect_postgres psql -U autoconnect_user -d db_autoconnect
```

### Redis
```bash
docker exec -it autoconnect_redis redis-cli
```

## Volumes

Les données sont persistées dans des volumes Docker :
- `postgres_data` : Données PostgreSQL
- `redis_data` : Données Redis

## Troubleshooting

### Port déjà utilisé
Si vous avez PostgreSQL/Redis installé localement, arrêtez-les ou changez les ports dans `docker-compose.yml`.

### Permissions
Sur Windows, assurez-vous que Docker Desktop a accès au disque C: dans les paramètres.
```

