import { Pool } from "pg";

export default class Database{
    private static instance: Database;
    private pool: Pool;

    private constructor(){
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT)
        })
    }
    public static getInstance() {
        if(!Database.instance){
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async query(text:string, params?: any[]){
        return this.pool.query(text, params);
    }

    public closeConn(){
        this.pool.end();
    }
}
