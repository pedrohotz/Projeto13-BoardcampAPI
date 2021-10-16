import pg from 'pg';
import express from 'express';
import joi from 'joi';
const { Pool } = pg;
const app = express();
app.use(express.json());

const connection = new Pool({ 
    user: 'bootcamp_role', 
    password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
    host: 'localhost',
    port: 5432, 
    database: 'boardcamp'});

app.get('/categories', async (req,res) => {
       
            const result = await connection.query(`SELECT * FROM "categories";`);
            res.status(200).send(result.rows);
 

            res.status(500);

    }) 


app.post('/categories',async (req,res) => {
    try{
        const { name } = req.body;
        if(!name || name === " "){
            res.status(400).send("Impossível enviar com campo vazio");
            return;
        }
        const categories = await connection.query('SELECT * FROM "categories";');
        if(categories.rows.some(categorie => categorie.name === name)){
            res.status(409).send("Categoria já existente");
            return;
        }
        else{
            await connection.query(`INSERT INTO "categories" (name) VALUES ($1);`,[name]);
            res.send("Categoria criada com sucesso");
            res.status(200);
        }
    }
    catch{
        res.status(201);
    }
})


app.get('/games',async (req,res)=>{
    const { name } = req.query;
    try{
        if (name){
            const  result = await connection.query(`SELECT * FROM games WHERE name ILIKE $1`, [`${name}%`])
            res.status(200).send(result.rows);
          }
        else{
            const result = await connection.query('SELECT games.*,categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id;');
            res.status(200).send(result.rows);
        }
    }
    catch{
        res.status(500);
    }
})

app.post('/games',async (req,res) =>{ 
    const game = req.body;
    const gameSchemma = joi.object({
        name: joi.string().alphanum().min(3).max(30).required(),
        image: joi.string().required(),
        stockTotal: joi.number().integer().min(1).required(),
        categoryId: joi.number().integer().min(1).required(),
        pricePerDay: joi.number().min(1).required(),
    })
    try{
      const value = await gameSchemma.validate(game)
      if (value.error){
          res.status(400).send("Campos inválidos")
          return;
      }
      const jogos = await connection.query('SELECT * FROM "games";');
      if(jogos.rows.some(jogo => jogo.name === game.name)){
          res.status(409).send("Jogo já existente");
          return;
      }
      else{
        await connection.query(`INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1,$2,$3,$4,$5);`,[game.name,game.image,game.stockTotal,game.categoryId,game.pricePerDay]);
        res.send("Jogo criado com sucesso");
        res.status(200);
      }
      
    }
    catch{
        res.status(201);
    }
})

app.get('/customers',async (req,res)=>{

})

app.listen(4000);