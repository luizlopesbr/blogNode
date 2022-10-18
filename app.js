//carregando módulos
const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')//chamar o arquivo de rotas
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)


const db = require('./config/db')

//Configurações---------------->

//Sessão
    app.use(session({
        secret: 'cursodenode',//chave que gera sessão
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    //Flash, tem que ser abaixo da sessão
    app.use(flash())

//Middleware
    app.use((req, res, next)=> {
        res.locals.success_msg = req.flash('success_msg')//.locals serve para criar variáveis globais 
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null;//variável user vai armazenar os dados do usuário autenticado - req.user é criado pelo passport e armazena esses dados. Se não houver usuário logado o que vai ser passado para a variável é o valor nulo.
        next()
    })

//Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

//Handlebars
    app.engine('handlebars', exphbs.engine({
        defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
        }
    }))
    app.set('view engine', 'handlebars')
    

//Mongoose
    mongoose.Promise = global.Promise;
    //mongoose.connect('mongodb://localhost/blogapp').then(()=>{
        mongoose.connect(db.mongoURI).then(()=>{
        console.log('Conectado ao mongoDB')
    }).catch((err)=>{
        console.log('Erro ao se conectar ao mongo: '+ err)
    })

//Public - arquivos estáticos
    app.use(express.static(path.join(__dirname,'public')))//diz que a pasta que guarda os arquivos estáticos é a public

    

//Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('index', {postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })
        
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Esta postagem não existe')
                red.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias: categorias})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias.')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) => {//pesquise posts que pertencem a categoria que foi passada no slug
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar os posts!')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)//chamar a rota

//Outros
/*
const PORT = 8081
app.listen(PORT, () => {
    console.log('servidor rodando!')
})
*/

const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log('servidor rodando!')
})