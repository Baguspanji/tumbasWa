const express = require('express')
const bodyParser = require('body-parser')
const wa = require('./wa.js')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(wa)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/try', (req, res) => {
    let body = req.body.messages
    res.json("Messages : ", body)
})

app.use((err, req, res, next) => {
    // because err.status is undefined 
    res.status(404).json({
        error: {
            message: err.message
        }
    });
})

var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})