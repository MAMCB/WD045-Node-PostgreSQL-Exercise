const express = require("express");
const app = express();
const port = process.env.PORT ||8000;
const {Pool} = require("pg");
require("dotenv/config");

const pool = new Pool({
    connectionString:process.env.ELEPHANT_SQL_CONNECTION_STRING,
});

app.use(express.json());

app.get("/",(req,res)=>res.send("Hello world!"));

app.get("/api/users", (req,res)=>{
    pool.query("SELECT * FROM users;").then(data=>{
        res.json(data.rows);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    })
});

app.get("/api/users/:id",(req,res)=>{
    const id = req.params.id;
    pool.query("SELECT * FROM users WHERE id = $1;",[id]).then(data=>{
        res.json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    })
})

app.post("/api/users",(req,res)=>{
    const {first_name,last_name,age}= req.body;
    pool.query("INSERT into users (first_name,last_name,age) VALUES($1,$2,$3) RETURNING *;",[first_name,last_name,age]).then(data=>{
        res.json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    })
})



app.listen(port,()=>console.log(`Server listening on port ${port}`));