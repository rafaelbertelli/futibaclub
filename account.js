const express = require('express')
const app = express.Router()

const init = connection => {
	
	// home
	app.get('/', async(req, res) => {
		const [rows, fields] = await connection.execute('select * from users')

		res.render('home')
	})

	// login
	app.get('/login', (req, res) => {
		res.render('new-account', { error: false, newAccount: false })
	})

	app.post('/login', async(req, res) => {
		const [rows, fields] = await connection.execute('select * from users where email = ?', [ req.body.email ])

		if (rows.length === 0) { // dont exists email
			res.render('new-account', { 
				error: 'Usuário e/ou senha inválidos.', 
				newAccount: false
			})

		} else {
			// quando tiver o pswd criptografado, fazer o decrypt aqui e verificar no banco se confere a senha

			if(rows[0].password === req.body.password) {
				const userDb = rows[0]
				const user = {
					id: userDb.id,
					name: userDb.nome,
					role: userDb.role
				}

				req.session.user = user
				res.redirect('/')

			} else {
				res.render('new-account', { 
					error: 'Usuário e/ou senha inválidos.',
					newAccount: false
				})
			}

		}

	})

	// logout
	app.get('/logout', (req, res) => {
		req.session.destroy( err => {
			res.redirect('/')
		})
	})

	// new account
	app.get('/new-account', (req, res) => {
		res.render('new-account', { error: false, newAccount: true })
	})

	app.post('/new-account', async(req, res) => {
		const { name, email, password } = req.body
		const [rows, fields] = await connection.execute('select nome, email from users where email = ?', [ email ])

		if (rows.length === 0) { // add new user
			// implementar aqui um cripter de senha
			const[inserted, insertFields] = await connection.execute('insert into users (nome, email, password, role) values(?,?,?,?)', [name,email,password,'user'])

			const user = {
				id: inserted.inserId,
				name: name,
				role: 'user'
			}

			req.session.user = user
			res.redirect('./')

		} else {
			res.render('new-account', {
				error: 'Usuário já existente'
			})
		}
		
	})

	return app

}

module.exports = init