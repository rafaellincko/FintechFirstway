const usuarios = require('./usuarios.js');
const anexos = require('./anexos.js')

const express = require('express');

var port = process.env.PORT || 3000;
const app = express();
const TOKEN = 'dGVzdGU6MTIz';

app.use(express.json());

console.log('Start..');
app.get('/usuarios', (req, resp)=> {
       if(hasAuthorization(req)){
              resp.status(200).send(usuarios);
       }else{
              semAutorizacao(resp);
       }
});

app.get('/usuarios/pj', (req, resp)=> {
       if(hasAuthorization(req)){
              resp.status(200).send(usuarios.filter(usuario => usuario.cnpj !== undefined));
       }else{
              semAutorizacao(resp);
       }
});

app.get('/usuarios/pj/:cnpj', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log('/usuarios/pj/'+req.params.cnpj);
              resp.status(200).send(usuarios.filter(usuario => usuario.cnpj === req.params.cnpj));
       }else{
              semAutorizacao(resp);
       }
});

app.get('/anexos/:id', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log('/anexos/'+req.params.id);
              resp.status(200).send(anexos.filter(anexo => anexo.id === req.params.id));
       }else{
              semAutorizacao(resp);
       }
});


app.get('/usuarios/pj/:cnpj/anexos', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log(req.params.cnpj);
              resp.status(200).send(usuarios.filter(usuario => usuario.cnpj === req.params.cnpj)[0].anexos);
       }else{
              semAutorizacao(resp);
       }
});

app.get('/usuarios/pj/:cnpj/anexos/:anexo', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log(req.params.cnpj);
              resp.status(200).send(
                     usuarios.filter(usuario => usuario.cnpj === req.params.cnpj)[0]
                     .anexos.filter(anexo => anexo.nome === req.params.anexo));
       }else{
              semAutorizacao(resp);
       }
});

app.post('/login', (req, resp)=> {
       if(req.body.username === 'teste' && req.body.password === '123'){
              resp.status(200).send({token: TOKEN});
       }else {
              semAutorizacao(resp);
       }
});

semAutorizacao = (resp) => {
       resp.status(401).send('Usuário ou senha invalidos');
}

hasAuthorization = (req) =>{
       let auth = 'Authorization';
       console.log("Return True");
       return true;

       if(req.headers[auth] === undefined){
              auth = auth.toLowerCase();
       }
       console.log("Autorizado ... "+req.headers[auth])
       return req.headers[auth] === 'Basic '+ TOKEN;
}

app.listen(port);
