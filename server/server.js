const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req,res) => {
    return res.json("Backend");
})

app.listen(3008, () => {
    console.log("The server has started");
})