const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
	res.render('home')
})

app.listen(port, err => {
	console.log('Futiba Club is running on port', port)
})