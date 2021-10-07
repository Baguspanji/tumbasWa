const router = require('express').Router()
const auth = require('../controller/auth')
const user = require('../controller/user')
const chat = require('../controller/chat')

module.exports = (app) => {

    // Chat
    router.get('/chat', chat.findAll)
    router.get('/get-chat', chat.getChat)
    
    // User
    router.get('/user', user.findAll)
    router.get('/get-user', user.getUser)
    router.get('/user/add', user.formAdd)
    router.post('/user', user.create)
    router.get('/user/edit/:id', user.formEdit)
    router.post('/user/:id', user.update)
    router.get('/user/delete/:id', user.destroy)

    // Login
    router.get('/user-profile', auth.user)
    router.get('/user-edit', auth.editUser)
    router.post('/user-edit', auth.UpdateUser)
    router.get('/login', auth.home)
    router.post('/login', auth.login)
    router.get('/logout', auth.logout)

    router.get('/', auth.dashboard)

    app.use('/', router)
}