import { Pool } from "pg";

export default class Database{
    private static instance: Database;
    private pool: Pool;

    private constructor(){
        this.pool = new Pool({
            user: "postgres",
            host: process.env.DB_HOST,
            database: "bd_projeto2",
            password:"1234",
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
