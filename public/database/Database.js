import { Pool } from "pg";
export default class Database {
    constructor() {
        this.pool = new Pool({
            user: "postgres",
            host: process.env.DB_HOST,
            database: "bd_projeto2",
            password: "1234",
            port: Number(process.env.DB_PORT)
        });
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async query(text, params) {
        return this.pool.query(text, params);
    }
    closeConn() {
        this.pool.end();
    }
}
