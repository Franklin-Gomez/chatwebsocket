import { Pool } from "pg";

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "chat",
    password: "eren0430",
    port: 5433,
});

export default pool;