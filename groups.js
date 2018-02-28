const express = require('express')
const app = express.Router()

const init = connection => {

	app.use((req, res, next) => { // middlewear que direciona para route de acordo com o login feito ou não
		
		if(!req.session.user)
			res.redirect('/')
		else
			next()
	})

	// groups
	app.get('/', async(req, res) => {
		// const [groups, fields] = await connection.execute('select * from groups')
		const [groups, fields] = await connection.execute(`select groups.id, groups.name, groups_users.role 
			from groups left join groups_users on 
				groups.id = groups_users.group_id and 
				groups_users.user_id = ? `, [
					req.session.user.id
		])

		res.render('groups/groups', {
			groups
		})
	})

	app.post('/', async(req, res) => {
		const { group_name } = req.body
		const[inserted, insertFields] = await connection.execute(`insert into groups (name) values (?)`, [group_name])

		await connection.execute('insert into groups_users (user_id, group_id, role) values (?,?,?)', [
			req.session.user.id,
			inserted.insertId,
			'owner'
		])
		
		res.redirect('/groups')
	})

	app.get('/:id', async(req, res) => {
		// se o usuario logado for owner do grupo, permitir a entrada
		const [own] = await connection.execute(`select groups_users.role
			from users
			inner join groups_users
				on users.id = groups_users.user_id
				and groups_users.role = ?
				and groups_users.id = ?
			where users.id = ?`, [
				'owner',
				req.params.id,
				req.session.user.id
			])

		if(own.length > 0) {
			const [pendings, fields] = await connection.execute(`select groups_users.id, users.nome, users.email
				from groups_users 
				inner join users 
					on groups_users.user_id = users.id 
					and groups_users.group_id = ?
					and groups_users.role = ?`, [
						req.params.id,
						'pending'
					])
	
			res.render('groups/group', { pendings })

		} else {
			res.redirect('/groups')
		}

	})

	app.get('/:id/join', async(req, res) => {
		const [rows, fields] = await connection.execute(`select role from groups_users where user_id = ? and group_id = ?`, [
			req.session.user.id,
			req.params.id			
		])

		if(rows.length > 0) {
			console.log('Usuário já tem relacionamento com este grupo')
			res.redirect('/groups')
		} else {
			await connection.execute('insert into groups_users (user_id, group_id, role) values (?,?,?)', [
				req.session.user.id,
				req.params.id,
				'pending'
			])

			res.redirect('/groups')
		}

	})

	app.get('/delete/:id', async(req, res) => {
		await connection.execute(`delete from groups where id = ? limit 1`, [ req.params.id ])

		res.redirect('/groups')
	})

	app.get('/:id/pending/:op', async(req, res) => {

		if(req.params.op === 'yes') {
			await connection.execute(`update groups_users set role = 'user' where id = ? limit 1`, [
				req.params.id
			])

			res.redirect('/groups')

		} else {

			await connection.execute(`delete from groups_users where id = ? limit 1`, [
				req.params.id
			])

			res.redirect('/groups')

		}

	})

	return app

}

module.exports = init