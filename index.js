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
    const { cpf } = req.query;
    try{
        if(cpf){
            const  result = await connection.query(`SELECT * FROM customers WHERE cpf ILIKE $1`, [`${cpf}%`])
            res.status(200).send(result.rows);
        }
        else{
            const result = await connection.query('SELECT * FROM customers;');
            res.status(200).send(result.rows);
        }
    }
    catch{
        res.status(201);
    }
})

app.get('/customers/:id',async (req,res) => {
    const { id } = req.params;
    try{
        const result = await connection.query('SELECT * FROM customers WHERE id = $1',[id]);
        if (result.rowCount === 0){
            res.status(404).send("Cliente Inexistente");
            return;
        }
        res.status(200).send(result.rows[0]);
    }
    catch{
        res.sendStatus(400);
    }
})
app.put('/customers/:id',async(req,res)=>{
    const customer = req.body;
    const { id } = req.params;
    const customerSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(/^[0-9]*$/).required(),
        cpf: joi.string().pattern(/^[0-9]*$/).length(11).required(),
        birthday: joi.date().greater('1-1-1900').required()
    })
    try{
        const value = await customerSchema.validate(customer);
        if(value.error){
            res.status(400).send("Campos inválidos")
            return;
        }
        const customers = await connection.query('SELECT * FROM customers;');
        if(customers.rows.some(cliente => cliente.cpf === customer.cpf)){
            res.status(409).send("Cliente ja cadastrado");
            return;
        }
        await connection.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5', [customer.name, customer.phone, customer.cpf, customer.birthday, id]);
        res.status(200).send("Cliente Atualizado")
    }
    catch{
        res.sendStatus(400);
    }

})

app.post('/customers',async(req,res) =>{
    const customer = req.body;
    const customerSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(/^[0-9]*$/).required(),
        cpf: joi.string().pattern(/^[0-9]*$/).length(11).required(),
        birthday: joi.date().greater('1-1-1900').required()
    })

    try{
        const value = await customerSchema.validate(customer);
        if(value.error){
            res.status(400).send("Campos inválidos")
            return;
        }
        const customers = await connection.query('SELECT * FROM customers;')
        if(customers.rows.some(cliente => cliente.cpf === customer.cpf)){
            res.status(409).send("Cliente ja cadastrado");
            return;
        }
        else{
            await connection.query(`INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4);`,[customer.name,customer.phone,customer.cpf,customer.birthday]);
            res.send("Cliente cadastrado com sucessso");
            res.status(200);
        }
    }
    catch{
        res.status(201);
    }
})


app.listen(4000);