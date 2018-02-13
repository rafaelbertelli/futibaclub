const express = require('express')
const app = express.Router()

const init = connection => {

	app.use((req, res, next) => { // middlewear que direciona para route de acordo com o login feito ou não
		
		if(!req.session.user || req.session.user.role !== 'root')
			res.redirect('/')
		else
			next()

	})

	// admin
	app.get('/', (req, res) => {
		res.send('admin')
	})

	// games
	app.get('/games', async(req, res) => {
		const [rows, fields] = await connection.execute('select * from games order by id desc')
		res.render('admin/games', {
			games: rows
		})
	})

	app.post('/games', async(req, res) => {
		const {team_a, team_b} = req.body
		await connection.execute('insert into games (team_a, team_b) values (?,?)', [team_a, team_b])

		res.redirect('/admin/games')
	})

	app.get('/games/delete/:id', async(req, res) => {
		await connection.execute('delete from games where id = ? limit 1', [ req.params.id ])

		res.redirect('/admin/games')
	})

	return app
}

module.exports = init