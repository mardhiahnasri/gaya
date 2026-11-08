Add schema changes here as numbered files (`002_add_x.sql`, …). Each file should end with
`INSERT INTO schema_migrations (version) VALUES ('002_add_x');`. Apply with:

```bash
docker exec -i gaya-postgres psql -U gaya -d gaya < migrations/002_add_x.sql
```
