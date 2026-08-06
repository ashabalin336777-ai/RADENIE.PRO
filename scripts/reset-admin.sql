-- Сброс пароля admin@radenie.pro на Radene2024!
-- docker compose exec -T postgres psql -U radenie -d radenie_pro < scripts/reset-admin.sql

UPDATE "User"
SET password = '$2a$12$yprRfgtVnW31DzWoYNvJSu9v262Amtj9RuDmC8vTA1QBElsmbAe1m',
    role = 'ADMIN'
WHERE email = 'admin@radenie.pro';

SELECT email, role, length(password) AS hash_len, left(password, 10) AS hash_start
FROM "User"
WHERE email = 'admin@radenie.pro';
