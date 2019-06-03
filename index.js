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
              console.log("/usuarios");
              resp.status(200).send(usuarios);
       }else{
              semAutorizacao(resp);
       }
});

app.get('/usuarios/pj', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log("/usuarios/pj");
              resp.status(200).send(usuarios.filter(usuario => usuario.cnpj !== undefined));
       }else{
              semAutorizacao(resp);
       }
});

app.get('/usuarios/pj/:cnpj', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log('/usuarios/pj/'+req.params.cnpj);
              let usuario;
              for(let i=0;i<usuarios.length;i++){
                     if(usuarios[i].cnpj==req.params.cnpj){
                            usuario = usuarios[i];
                            break;
                     }
                     
              }

              if(usuario == undefined || usuario == null){
                     console.log("Usuário não encontrado!");
                     resp.status(500).send("Usuário não encontrado!");
              } else {
                     resp.status(200).send(usuario);
              }
     
       }else{
              semAutorizacao(resp);
       }
});

app.get('/anexos/:documento/:id', (req, resp)=> {
       console.log('/anexos/{documento}/{id}');
       if(hasAuthorization(req)){
              console.log('/anexos/'+req.params.documento+"/"+req.params.id);
              let a;
              for(let i=0;i<anexos.length;i++){
                     if(anexos[i].documento==req.params.documento && anexos[i].id==req.params.id){
                            a = anexos[i];
                            break;
                     }
                     
              }
              if(a==undefined || a==null){
                     console.log(".. Anexo nao encontrado...");
                     resp.status(500).send("Anexo nao encontrado!");
              } else {
                     console.log(a.id+" documento:"+a.documento+" tipo: "+a.tipo);
                     resp.status(200).send(a);
              }
       }else{
              semAutorizacao(resp);
       }
});


app.get('/usuarios/pj/:cnpj/anexos', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log("/usuarios/pj/"+req.params.cnpj+"/anexos");
              resp.status(200).send(usuarios.filter(usuario => usuario.cnpj === req.params.cnpj)[0].anexos);
       }else{
              semAutorizacao(resp);
       }
});

app.get('/usuarios/pj/:cnpj/anexos/:anexo', (req, resp)=> {
       if(hasAuthorization(req)){
              console.log("/usuarios/pj/"+req.params.cnpj+"/anexos/"+req.params.anexo);
              resp.status(200).send(
                     usuarios.filter(usuario => usuario.cnpj === req.params.cnpj)[0]
                     .anexos.filter(anexo => anexo.nome === req.params.anexo));
       }else{
              semAutorizacao(resp);
       }
});

app.post('/login', (req, resp)=> {
       console.log("/login "+req.body.username+"("+req.body.password+")");
       if(req.body.username === 'teste' && req.body.password === '123'){
              resp.status(200).send({token: TOKEN});
       }else {
              semAutorizacao(resp);
       }
});

semAutorizacao = (resp) => {
       console.log('Usuário ou senha invalido!');
       resp.status(401).send('Usuário ou senha invalidos');
}

hasAuthorization = (req) =>{
        ;

       let auth = 'Authorization';
       
       if(req.headers[auth] === undefined){
              auth = auth.toLowerCase();
       }
       console.log("Should be..... [Basic "+ TOKEN+"]");
       console.log("Autorizado ... ["+req.headers[auth]+"]");
       //return true; 
       return req.headers[auth] === 'Basic '+ TOKEN;
}

app.listen(port);
