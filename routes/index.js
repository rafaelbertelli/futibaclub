const express = require('express')
const app = express()
const mysql = require('mysql2/promise')
const account = require('./account')
const bodyParser = require('body-parser')
const session = require('express-session')

const port = 3000

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
	secret: 'fullstack-academy',
	resave: true,
	saveUninitialized: true
}))

app.set('view engine', 'ejs')

const init = async () => {

	const connection = await mysql.createConnection({
		host: '127.0.0.1',
		user: 'root',
		password: '1801/Rafa',
		database: 'futibaclub'
	})

	app.use( (req, res, next) => { // middlewear para regra de usuario logado
		if(req.session.user)
			res.locals.user = req.session.user
		else
			res.locals.user = false

		next()
	})

	app.use(account(connection))

	app.listen( port, err => console.log(`Futiba Club is running on port ${port}`) )
}

init()