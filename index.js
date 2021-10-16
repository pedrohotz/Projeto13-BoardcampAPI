import pg from 'pg';
import express from 'express';

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
        try{
            const result = await connection.query('SELECT * FROM categories;');
            res.status(200).send(result.rows);
        }
        catch{
            res.status(500);
        }
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

app.listen(4000);