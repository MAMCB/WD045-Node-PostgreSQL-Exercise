const express = require("express");
const app = express();
const port = process.env.PORT ||8000;
const {Pool} = require("pg");
require("dotenv/config");

const pool = new Pool({
    connectionString:process.env.ELEPHANT_SQL_CONNECTION_STRING,
});


app.get("/",(req,res)=>res.send("Hello world!"));

app.get("/api/users", (req,res)=>{
    pool.query("SELECT * FROM users;").then(data=>{
        res.json(data.rows);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    })
});



app.listen(port,()=>console.log(`Server listening on port ${port}`));