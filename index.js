const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT ||8000;
const {check,oneOf, validationResult} = require("express-validator");
const {Pool} = require("pg");
require("dotenv/config");

const pool = new Pool({
    connectionString:process.env.ELEPHANT_SQL_CONNECTION_STRING,
});

app.use(express.json());
app.use(cors());

const validateUser = [
    check("first_name").isString(),
    check("last_name").isString(),
    check("age").isString(),
    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }
        next();
    }
]

const validateOrder = [
  check("price").isString(),
  check("date").isString(),
  check("user_id").isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUserField = [
    oneOf([
        check("first_name").exists(),
        check("last_name").exists(),
        check("age").exists(),
    ]),(req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();

    }

]

const validateOrderField = [
  oneOf([
    check("price").exists(),
    check("date").exists(),
    check("user_id").exists(),
  ]),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

app.get("/",(req,res)=>res.send("Hello world!"));

app.get("/api/users", (req,res)=>{
    pool.query("SELECT * FROM users;").then(data=>{
        res.json(data.rows);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    })
});

app.get("/api/orders", (req, res) => {
  pool
    .query("SELECT * FROM orders;")
    .then((data) => {
      res.json(data.rows);
    })
    .catch((e) => {
      res.status(500).json({ message: e.message });
    });
});

app.get("/api/users/:id",(req,res)=>{
    const id = req.params.id;
    pool.query("SELECT * FROM users WHERE id = $1;",[id]).then(data=>{
        res.json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    })
})

app.get("/api/orders/:id", (req, res) => {
  const id = req.params.id;
  pool
    .query("SELECT * FROM orders WHERE id = $1;", [id])
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => {
      res.status(500).json({ message: e.message });
    });
});

app.post("/api/users",validateUser,(req,res)=>{
    const {first_name,last_name,age}= req.body;
    pool.query("INSERT into users (first_name,last_name,age) VALUES($1,$2,$3) RETURNING *;",[first_name,last_name,age]).then(data=>{
        res.json(data.rows[0]);
    }).catch(e=>{
        res.status(500).json({message:e.message});
    })
})

app.post("/api/orders", validateOrder, (req, res) => {
  const { price, date, user_id } = req.body;
  pool
    .query(
      "INSERT into orders (price,date,user_id) VALUES($1,$2,$3) RETURNING *;",
      [price, date, user_id]
    )
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => {
      res.status(500).json({ message: e.message });
    });
});

app.put("/api/users/:id",validateUserField,(req,res)=>{
    const id = req.params.id;
    if(req.body.first_name)
    {
       pool.query("UPDATE users SET first_name= $1 WHERE id=$2 RETURNING *;",[req.body.first_name,id]).then(data=>{
        res.json(data.rows[0]);
       }).catch(e=>{
        res.status(500).json({message:e.message});
       })
    }
    else if(req.body.last_name)
    {
        pool
          .query("UPDATE users SET last_name= $1 WHERE id=$2 RETURNING *;", [
            req.body.last_name,
            id,
          ])
          .then((data) => {
            res.json(data.rows[0]);
          })
          .catch((e) => {
            res.status(500).json({ message: e.message });
          });
    }
    else if(req.body.age)
    {
         pool
           .query("UPDATE users SET age= $1 WHERE id=$2 RETURNING *;", [
             req.body.age,
             id,
           ])
           .then((data) => {
             res.json(data.rows[0]);
           })
           .catch((e) => {
             res.status(500).json({ message: e.message });
           });

    }
    else
    {
        res.status(400).json({errors:"No valid field to update"})
    }
    

})

app.put("/api/orders/:id", validateOrderField, (req, res) => {
  const id = req.params.id;
  if (req.body.price) {
    pool
      .query("UPDATE orders SET price= $1 WHERE id=$2 RETURNING *;", [
        req.body.price,
        id,
      ])
      .then((data) => {
        res.json(data.rows[0]);
      })
      .catch((e) => {
        res.status(500).json({ message: e.message });
      });
  } else if (req.body.date) {
    pool
      .query("UPDATE orders SET date= $1 WHERE id=$2 RETURNING *;", [
        req.body.date,
        id,
      ])
      .then((data) => {
        res.json(data.rows[0]);
      })
      .catch((e) => {
        res.status(500).json({ message: e.message });
      });
  } else if (req.body.user_id) {
    pool
      .query("UPDATE orders SET user_id= $1 WHERE id=$2 RETURNING *;", [
        req.body.user_id,
        id,
      ])
      .then((data) => {
        res.json(data.rows[0]);
      })
      .catch((e) => {
        res.status(500).json({ message: e.message });
      });
  } else {
    res.status(400).json({ errors: "No valid field to update" });
  }
});

app.delete("/api/users/:id",(req,res)=>{
    const id = req.params.id;
    pool.query("DELETE FROM users WHERE id=$1 RETURNING *;",[id]).then((data)=>{
        res.json(data.rows[0]);
    }).catch((e)=>{
        res.status(500).json({message:e.message});
    })
});

app.delete("/api/orders/:id", (req, res) => {
  const id = req.params.id;
  pool
    .query("DELETE FROM orders WHERE id=$1 RETURNING *;", [id])
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => {
      res.status(500).json({ message: e.message });
    });
});




app.listen(port,()=>console.log(`Server listening on port ${port}`));