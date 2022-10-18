module.exports = {//permitir que apenas usuários logados entrem em certas rotas do sistema
    eAdmin: function(req, res, next){

        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash('error_msg', 'Você precisa ser um Admin')
        res.redirect('/')


    }
}