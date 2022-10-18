if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://luiz:zDwbRdlPuRTC0mZg@teste.c2he0dp.mongodb.net/?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}