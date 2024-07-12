const express = require('express')
const jsonServer = require('json-server')
const path = require('path')
const PORT = process.env.PORT || 4040

const app = express()
const apiRouter = jsonServer.router(path.join(__dirname, 'datos.json'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/api', jsonServer.defaults(), apiRouter)

app.listen(PORT, () => console.log('Servidor corriendo en http://localhost:'+PORT))
