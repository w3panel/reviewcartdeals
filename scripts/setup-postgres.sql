-- Run as a PostgreSQL superuser (e.g. psql -U postgres -f scripts/setup-postgres.sql)
-- Creates the app database and user used by .env.example

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reviewcartdeals') THEN
    CREATE ROLE reviewcartdeals LOGIN PASSWORD 'reviewcartdeals';
  END IF;
END
$$;

SELECT 'CREATE DATABASE reviewcartdeals OWNER reviewcartdeals'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'reviewcartdeals')\gexec

GRANT ALL PRIVILEGES ON DATABASE reviewcartdeals TO reviewcartdeals;
