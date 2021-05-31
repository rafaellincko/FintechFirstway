const usuarios = require('./usuarios.js');
const anexos = require('./anexos.js');
const jtoken = require('./token.js');
const request = require('sync-request');

const express = require('express');

const servidorOrigem = 'http://'+'api-uat'+
'.b'+'an'+'cov'+'o'+'tora'+'n'+'tim'+
'.com.br';
var port = process.env.PORT || 3000;
const app = express();
const TOKEN = 'dGVzdGU6MTIz'; // teste 123
var token2=undefined;
var dateFormat = require('dateformat');
var ultimos100logs=[];
var maxLog=1000;
var atualLog=0;


// app.use(express.json());

var bodyParser = require('body-parser');
const { Http2ServerRequest } = require('http2');
const { chdir } = require('process');
const { isObject } = require('util');
app.use(bodyParser.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
//app.use('/validaConta', express.json());

regLog= (texto) =>{
       var texto2=''
       if(true){
              texto2 =JSON.stringify(texto)
       } else {
              texto2 = texto
       }
       let registro = dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss")+'-'+texto2;       
       if(maxLog>=ultimos100logs.length){
              ultimos100logs.push(registro)
              //console.log("> "+registro)
       } else {
              for(var i=0;i<ultimos100logs.length-1;i++){
                     ultimos100logs[i]=ultimos100logs[i+1]
              }
              ultimos100logs[maxLog-1] = registro
              //console.log("- "+registro)
       }
};

regLog('Start..');
app.get('/usuarios', 
       (req, resp)=> {
              if(hasAuthorization(req)){
                     regLog("/usuarios");
                     resp.status(200).send(usuarios);
              }else{
                     semAutorizacao(req, resp);
              }
       }
       );

app.get('/usuarios/pj', 
       (req, resp)=> {
              if(hasAuthorization(req)){
                     regLog("/usuarios/pj");
                     resp.status(200).send(usuarios.filter(usuario => usuario.cnpj !== undefined));
              }else{
                     semAutorizacao(req, resp);
              }
       });

app.get('/usuarios/pj/:cnpj', 
       (req, resp)=> {
              
                     if(hasAuthorization(req)){
                            regLog('/usuarios/pj/'+req.params.cnpj);
                            let usuario;
                            for(let i=0;i<usuarios.length;i++){
                                   if(usuarios[i].cnpj==req.params.cnpj){
                                          usuario = usuarios[i];
                                          break;
                                   }
                                   
                            }
       
                            if(usuario == undefined || usuario == null){
                                   regLog("Usuário não encontrado!");
                                   resp.status(500).send("Usuário não encontrado!");
                            } else {
                                   resp.status(200).send(usuario);
                            }
              
                     }else{
                            semAutorizacao(req, resp);
                     }

       });

app.get('/anexos/:documento/:id', 
       (req, resp)=> {
              regLog('/anexos/{documento}/{id}');
              if(hasAuthorization(req)){
                     regLog('/anexos/'+req.params.documento+"/"+req.params.id);
                     let a;
                     for(let i=0;i<anexos.length;i++){
                            if(anexos[i].documento==req.params.documento && anexos[i].id==req.params.id){
                                   a = anexos[i];
                                   break;
                            }
                            
                     }
                     if(a==undefined || a==null){
                            regLog(".. Anexo nao encontrado...");
                            resp.status(500).send("Anexo nao encontrado!");
                     } else {
                            regLog(a.id+" documento:"+a.documento+" tipo: "+a.tipo);
                            resp.status(200).send(a);
                     }
              }else{
                     semAutorizacao(req, resp);
              }
       });


app.get('/usuarios/pj/:cnpj/anexos', 
       (req, resp)=> {
              if(hasAuthorization(req)){
                     regLog("/usuarios/pj/"+req.params.cnpj+"/anexos");
                     resp.status(200).send(usuarios.filter(usuario => usuario.cnpj === req.params.cnpj)[0].anexos);
              }else{
                     semAutorizacao(req, resp);
              }
       });

app.get('/usuarios/pj/:cnpj/anexos/:anexo', 
       (req, resp)=> {
              if(hasAuthorization(req)){
                     regLog("/usuarios/pj/"+req.params.cnpj+"/anexos/"+req.params.anexo);
                     resp.status(200).send(
                            usuarios.filter(usuario => usuario.cnpj === req.params.cnpj)[0]
                            .anexos.filter(anexo => anexo.nome === req.params.anexo));
              }else{
                     semAutorizacao(req, resp);
              }
       });

app.post('/login', 
       (req, resp)=> {
              regLog("/login "+req.body.username+"("+req.body.password+")");
              if(req.body.username === 'teste' && req.body.password === '123'){
                     resp.status(200).send({token: TOKEN});
              }else {
                     semAutorizacao(req, resp);
              }
       });

semAutorizacao = 
       (req, resp) => {
              let auth = 'Authorization';
              
              if(req.headers[auth] === undefined){
                     auth = auth.toLowerCase();
              }

              const msg = auth+" invalida! ["+req.headers[auth]+"]";
              regLog(msg);
              resp.status(401).send(msg);
       }

hasAuthorization = 
       (req) =>{
              let auth = 'Authorization';
              
              regLog(req.headers);
              if(req.headers[auth] === undefined){
                     auth = auth.toLowerCase();
              }
              if(req.headers[auth] === 'Basic '+ TOKEN ) {
                     regLog("[Basic "+ TOKEN+"]");
                     return true;
              }
              if(req.headers[auth] === jtoken.token_type+" "+jtoken.access_token){
                     regLog(" ["+jtoken.token_type+" "+jtoken.access_token);
                     return true;
                 
              }
              const keyToken = jtoken.token_type+" "+jtoken.access_token;
              try {
                     regLog(' KeyToken '+keyToken);
                     regLog(' Header '+req.headers[auth].substring(0,31));
                     if(req.headers[auth].substring(0,31) === keyToken.substring(0,31)){
                            regLog(" Validando periodo!");
                            const strData = req.headers[auth].substring(31,41);
                            regLog("Cabec "+req.headers[auth]);
                            regLog("Cabec "+req.headers[auth].substring(0,31));
                            const now = new Date();
                            const ano = "20"+strData.substring(0,2);
                            const mes = strData.substring(2,4);
                            const dia = strData.substring(4,6);
                            const hora = strData.substring(6,8);
                            const minuto = strData.substring(8,10);
                            regLog(" StrData "+ano+"-"+mes+"-"+
                                          dia+" "+
                                          hora+":"+
                                          minuto+" "); 

                            let dt = new Date(ano+"-"+mes+"-"+dia+" "+hora+":"+minuto+":00");
                            regLog(dateFormat(dt, "dd/mm/yyyy HH:MM"));       
                            dt.setSeconds(dt.getSeconds()+3600);     
                            regLog(dateFormat(dt, "dd/mm/yyyy HH:MM"));       
                            return now<=dt;
                     
                     }
              }catch(e){
                     regLog(e);
                     return false;
              }

       }

app.post('/auth/oauth/v1/token', 
       (req, resp)=> {
              regLog("/auth/oauth/v1/token ");
              console.dir(req.body);
              regLog("--------------------------");
              if(req.body.client_id==='resource.jalmeida' &&
                     req.body.client_secret==='teste' &&
                     req.body.grant_type==='client_credentials'){
                     regLog("Ok! "+req.body.client_id);
                     let ktoken = jtoken;
                     const now = new Date();
                     regLog(" Date "+dateFormat(now, "yymmddHHMM"))

                     ktoken.access_token = jtoken.access_token.substring(0,24)+dateFormat(now, "yymmddHHMM")+"bd";
                     console.dir(jtoken);
                     regLog("============");
                     console.dir(ktoken);
                     resp.status(200).send(jtoken);
              } else {
                     regLog("NOk!");
                     resp.status(401).send('Usuário ou senha invalidos');
              }
              regLog("--------------------------");
       }
       );


       app.post('/incluirConta', 
              (req, resp)=> {
                     
                     if(hasAuthorization(req)){
                            regLog("Result ");
                            regLog(req.body);
                            regLog("--------------------------");
                            const res_data = req.body;
                            /*
                            let retorno = '{ "numeroProtocolo": "'+res_data.numeroProtocolo+
                                          '", "statusConta": "'+res_data.statusRelacionamento+
                                          '", "dataInicio":"'+res_data.dataInicio+
                                          '", "dataFim:" :';
                            if(res_data.dataFim===null) {
                                   retorno +='null';
                            } else {
                                   retorno +='"'+res_data.dataFim+'"';
                            }
                            retorno += ' , "statusProcessamento": "Confirmado", '+
                                          '"idProcessamento": 1234567890 } ';
                            */
                           let retorno=" ";
                           try {
                                   if(res_data.codigoTipoMovimento===null){
                                          throw  new Error('É obrigatorio informar o tipo do movimento');
                                   } else {
                                          if(res_data.codigoTipoMovimento===1 || res_data.codigoTipoMovimento===2){
                                                 regLog('codigoTipoMovimento ok! ');
                                          } else {
                                                 throw new Error('O codigoTipoMovimento deve ser 1 - Inclusao ou 2 - alteracao '+res_data.codigoTipoMovimento);

                                          }
                                   }
                                   if(res_data.numeroConta===null || res_data.numeroConta===""){
                                          throw new Error('numeroConta Invalido!');
                                   }
                                   retorno = '{ "statusCadastro": "OK", "descricaoMensagemRetorno": "'+res_data.protocolo+'XPTO" } ';
                                   regLog(" Agencia/Conta: "+res_data.numeroAgencia+" / "+res_data.numeroConta);
                                   regLog(" Data Inicio: "+res_data.dataInicio);
                                   regLog(" Protocolo: "+res_data.protocolo);

                                   let pessoas = res_data.listaUsuario.usuario;
                                   for(let i=0;i<pessoas.length;i++){
                                          regLog("-----------------------------------------")
                                          regLog("      Pessoa/Documento: "+pessoas[i].nome+" / "+pessoas[i].numeroDocumento);
                                          regLog("      tipoPessoa:"+pessoas[i].tipoPessoa);
                                          regLog("      codigoTipoVinculo:"+pessoas[i].codigoTipoVinculo);
                                   }
                                   regLog("-----------------------------------------");
                                   regLog("Retorno");
                                   regLog("---------------------------------------");
                                   regLog(retorno);
                                   regLog("---------------------------------------");
                                   
                                   resp.status(200).send(retorno);

                            }catch( e){
                                   regLog("--------------------------------------");
                                   regLog(" Erro ");
                                   regLog(e);
                                   regLog("--------------------------------------------");
                                   retorno = '{ "statusCadastro": "NOK", "descricaoMensagemRetorno": "'+e+'" } ';
                                   resp.status(200).send(retorno);
                            }
                            
                            //resp.status(200).send(retorno);
                            //resp.status(200).send(usuarios);
                     }else{
                            semAutorizacao(req, resp);
                     }
              }
              );
       
              app.post('/bloquearDesbloquearConta', 
              (req, resp)=> {
                     
                     if(hasAuthorization(req)){
                            regLog("Result ");
                            regLog(req.body);
                            regLog("--------------------------");
                            const res_data = req.body;
                            /*
                            let retorno = '{ "numeroProtocolo": "'+res_data.numeroProtocolo+
                                          '", "statusConta": "'+res_data.statusRelacionamento+
                                          '", "dataInicio":"'+res_data.dataInicio+
                                          '", "dataFim:" :';
                            if(res_data.dataFim===null) {
                                   retorno +='null';
                            } else {
                                   retorno +='"'+res_data.dataFim+'"';
                            }
                            retorno += ' , "statusProcessamento": "Confirmado", '+
                                          '"idProcessamento": 1234567890 } ';
                            */
                           let retorno=" ";
                           try {
                                  try {
                                         if(res_data.codigoStatusRelacionamentoConta!=1){
                                                if(res_data.codigoStatusRelacionamentoConta!=2){
                                                       throw new Error('Status do relacionamento nao pode ser diferente de 1 ou 2!');
                                                }
                                         }
                                  } catch(e){
                                         throw new Error('É obrigatório informar codigoStatusRelacionamentoConta!'+e);
                                  }
                                  try {
                                         if(res_data.descricaoMotivoBloqueio.length===0){
                                           throw new Error('É obrigatório informar descricaoMotivoBloqueio!');
                                         }
                                  } catch(e){
                                          throw new Error('É obrigatório informar descricaoMotivoBloqueio!')
                                  }
                                  try {
                                          if(res_data.numeroConta.length===0){
                                                 throw new Error('É obrigatorio informar o numero da conta!');
                                          }
                                   } catch(e){
                                          throw new Error('E obrigatorio informar o numero da conta ');            
                                   }
                                   retorno = '{ "statusCadastro": "OK", "descricaoMensagemRetorno": "Blocked/Unblocked" } ';
                                   regLog(" Agencia/Conta: "+res_data.numeroAgencia+" / "+res_data.numeroConta);
                                   regLog(" Status: "+res_data.codigoStatusRelacionamentoConta);
                                   regLog(" Motivo: "+res_data.descricaoMotivoBloqueio);
                                   regLog(" Data: "+res_data.dataInicio);
                                   regLog('--------------------------------------');
                                   resp.status(200).send(retorno);
                                   regLog('--------------------------------------');
                                   
                            }catch( e){
                                   retorno = '{ "statusCadastro": "NOK", "descricaoMensagemRetorno": "Erro: '+e+'" } ';
                                   resp.status(200).send(retorno);

                            }
                            
                            //resp.status(200).send(usuarios);
                     }else{
                            semAutorizacao(req, resp);
                     }
              }
              );

              app.post('/encerrarConta', 
              (req, resp)=> {
                     
                     if(hasAuthorization(req)){
                            regLog("Result ");
                            regLog(req.body);
                            regLog("--------------------------");
                            const res_data = req.body;

                            let retorno=" ";
                            try {
                                   try {
                                          if(res_data.numeroConta.length===0){
                                                 throw new Error('Conta vazia!');
                                          }
                                   } catch(e){
                                         throw new Error('É obrigatório informar numeroConta!'+e);
                                   }

                                   try {
                                          if(res_data.dataInicio.length===0){
                                                 throw new Error('Data vazia!');
                                          }
                                   } catch(e){
                                         throw new Error('É obrigatório informar o inicio da conta!'+e);
                                   }
                                   try {
                                          if(res_data.dataFim.length===0){
                                                 throw new Error('Data vazia!');
                                          }
                                   } catch(e){
                                         throw new Error('É obrigatório informar o encerramento (dataFim)!'+e);
                                   }

                                   try {
                                          if(res_data.listaUsuario.usuario.length===0){
                                                 throw new Error('lista de usuário vazia!');
                                          }
                                   } catch(e){
                                         throw new Error('É obrigatório informar o usuários da conta!'+e);
                                   }

                                   try {
                                          let pessoas = res_data.listaUsuario.usuario;
                                          for(let i=0;i<pessoas.length;i++){
                                                 regLog(" Pessoa/Documento: "+pessoas[i].nome+" / "+pessoas[i].numeroDocumento);
                                          }
       
                                   } catch(e){
                                          throw new Error('Erro na leitura de pessoas '+e);
                                   }
                                   regLog('--------------------------------------');
                                   retorno = '{ "statusCadastro": "OK", "descricaoMensagemRetorno": "" } ';
                                   regLog('--------------------------------------');
                                   
                                   resp.status(200).send(retorno);
                            }catch( e){
                                   regLog('--------------------------------------');
                                   retorno = '{ "statusCadastro": "NOK", "descricaoMensagemRetorno": "Erro: '+e+'" } ';
                                   regLog('--------------------------------------');
                                   resp.status(200).send(retorno);
                            }
                            
                            //resp.status(200).send(retorno);
                            //resp.status(200).send(usuarios);
                     }else{
                            semAutorizacao(req, resp);
                     }
              }
              );

       /*
       -------------------------------------------------------------------------------------------------
       Funcionalidade do BJUD
       -------------------------------------------------------------------------------------------------
       */
      app.post('/bloquearSolicitacaoJudicial', 
              (req, resp)=> {
             
                     if(hasAuthorization(req)){
                            regLog("- bloquearSolicitacaoJudicial -------------------------");
                            regLog(req.body);
                            regLog("------------------------------")
                            const res_data = req.body;
                            let retorno=" ";
                            let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
                            try {
                                   regLog("cnpjBaseSolicitacao:"+res_data.cnpjBaseSolicitacao)
                                   if(res_data.cnpjBaseSolicitacao===""){
                                          throw new Error(" cnpjBaseSolicitacao nao pode ser nula ")
                                   }
                                   regLog("tipoCliente:"+res_data.tipoCliente)
                                   if(res_data.tipoCliente.substring(0,1)!="F" &&
                                          res_data.tipoCliente.substring(0,1)!="J"){
                                                 throw new Error('Tipo Cliente nao pode ser diferente de Fisica ou Jurica');
                                   }
                                   regLog("numeroAgencia")
                                   if(res_data.numeroAgencia != undefined){
                                          res_data.numeroAgencia = res_data.numeroAgencia.trim()
                                          if(res_data.numeroAgencia!=""){
                                                 throw new Error('Numero de agência nao pode ser diferente de nulo. ['+res_data.numeroAgencia+']');
                                          }
                                   } 
                                   regLog("cpfCnpjRaizCliente...")
                                   res_data.cpfCnpjRaizCliente = res_data.cpfCnpjRaizCliente.trim()
                                   if(res_data.cpfCnpjRaizCliente==""){
                                          throw new Error('cpfCnpjRaizCliente nao pode ser nullo');
                                   }
                                   regLog("numeroConta")
                                   if(res_data.numeroConta==""){
                                          throw new Error('numeroConta nao pode ser nullo');
                                   }
                                   regLog("indicadorValorTotal")
                                   if(res_data.indicadorValorTotal.substring(0,1)!="S" && 
                                          res_data.indicadorValorTotal.substring(0,1)!="N"){
                                          throw new Error('indicadorValorTotal deve ser Sim, ou Nou');
                                   }
                                   regLog("codigoProtocolo")
                                   if(res_data.codigoProtocolo==""){
                                          throw new Error('codigoProtocolo nao pode ser nullo');
                                   }
                                   regLog("codigoSequenciaProtocolo")
                                   if(res_data.codigoSequenciaProtocolo==""){
                                          throw new Error('codigoSequenciaProtocolo nao pode ser nullo');
                                   }
                                   regLog("nomeInstituicao")
                                   if(res_data.nomeInstituicao==""){
                                          throw new Error('nomeInstituicao nao pode ser nullo');
                                   }
                                   regLog("dataBloqueio")
                                   
                                   if(res_data.dataBloqueio==""){
                                          throw new Error('dataBloqueio nao pode ser nullo');
                                   }
                                   regLog("numeroProcesso")
                                   if(res_data.numeroProcesso==""){
                                          throw new Error('numeroProcesso nao pode ser nullo');
                                   }
                                   regLog("nomeVaraJuizo")
                                   if(res_data.nomeVaraJuizo==""){
                                          throw new Error('nomeVaraJuizo nao pode ser nullo');
                                   }
                                   regLog("NomeAutor")
                                   if(res_data.NomeAutor==""){
                                          throw new Error('NomeAutor nao pode ser nullo');
                                   }
                                   regLog("valorBloqueio")
                                   if(res_data.valorBloqueio<=0){
                                          throw new Error('valorBloqueio tem que ser maior que zero');
                                   }

                                   //const valorEfetivo = res_data.valorBloqueio / 2
                                   //const msgBloqueio = "Resp:"+res_data.codigoProtocolo+"-"+res_data.codigoSequenciaProtocolo
                                   //const descricaoResp = "Solicitação atendida parcialmente"
                                   const valorEfetivo = res_data.valorBloqueio 
                                   const msgBloqueio = "Resp:"+res_data.codigoProtocolo+"-"+res_data.codigoSequenciaProtocolo
                                   const descricaoResp = "Solicitação atendida"
                                   
                                   regLog(" Data "+dt)
                                   // simulacao de erro
                                   // "descricaoReposta": descricaoResp,
                                   retorno = {
                                          "codigoResposta": "OK",
                                          "descricaoReposta": descricaoResp,
                                          "identificadorBloqueioLegado": msgBloqueio,
                                          "valorEfetivado": valorEfetivo,
                                          "QtdeAtivosEfetivada": "1",
                                          "dataHoraEXCC": dt,
                                          "numeroDiasResgate": 0
                                   }

                           
                            }catch( e){
                                   retorno = {
                                          "codigoResposta": "ERRO",
                                          "descricaoReposta": "Erro "+e,
                                          "identificadorBloqueioLegado": "Erro:"+res_data.codigoProtoocolo+"-"+res_data.codigoSequenciaProtocolo,
                                          "valorEfetivado": 0,
                                          "QtdeAtivosEfetivada": "1",
                                          "dataHoraEXCC": dt,
                                          "numeroDiasResgate": 0
                                   }

                            }
                     regLog('--------------------------------------');
                     regLog(JSON.stringify(retorno))
                     resp.status(200).send(retorno);
                     regLog('--------------------------------------');
             }else{
                    semAutorizacao(req, resp);
             }
       });

       app.post('/desbloquearIntraday', 
       (req, resp)=> {
      
              if(hasAuthorization(req)){
                     regLog("- desbloquearIntraday -------------------------");
                     regLog(req.body);
                     regLog("------------------------------")
                     const res_data = req.body;
                     let retorno=" ";
                     let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
                     try {

                            if(res_data.cnpjBaseSolicitacao===""){
                                   throw new Error(" cnpjBaseSolicitacao nao pode ser nula ")
                            }
                            if(res_data.tipoCliente.substring(0,1)!="F" &&
                                   res_data.tipoCliente.substring(0,1)!="J"){
                                          throw new Error('Tipo Cliente nao pode ser diferente de Fisica ou Jurica');
                            }
                            if(res_data.cpfCnpjRaizCliente==""){
                                   throw new Error('cpfCnpjRaizCliente nao pode ser nullo');
                            }
                            if(res_data.numeroAgencia!=undefined && res_data.numeroAgencia!=""){
                                   throw new Error('Numero de agência nao pode ser diferente de vazio ['+res_data.numeroAgencia+']');
                            }
                            if(res_data.numeroConta==""){
                                   throw new Error('numeroConta nao pode ser nullo');
                            }
                            if(res_data.codigoProtocolo==""){
                                   throw new Error('codigoProtocolo nao pode ser nullo');
                            }
                            if(res_data.codigoSequenciaProtocolo==""){
                                   throw new Error('codigoSequenciaProtocolo nao pode ser nullo');
                            }
                            if(res_data.codigoSequenciaDesbloqueioProtocolo==""){
                                   throw new Error('codigoSequenciaDesbloqueioProtocolo nao pode ser nullo');
                            }
                            if(res_data.nomeInstituicao==""){
                                   throw new Error('nomeInstituicao nao pode ser nullo');
                            }
                            if(res_data.dataBloqueio==""){
                                   throw new Error('dataBloqueio nao pode ser nullo');
                            }
                            if(res_data.numeroProcesso==""){
                                   throw new Error('numeroProcesso nao pode ser nullo');
                            }
                            if(res_data.nomeVaraJuizo==""){
                                   throw new Error('nomeVaraJuizo nao pode ser nullo');
                            }
                            if(res_data.NomeAutor==""){
                                   throw new Error('NomeAutor nao pode ser nullo');
                            }
                            if(res_data.valorBloqueio<=0){
                                   throw new Error('valorBloqueio tem que ser maior que zero');
                            }

                     regLog(" Data "+dt)
                            retorno = {
                                   "codigoResposta": "OK",
                                   "descricaoReposta": "Solicitação atendida",
                                   "identificadorDesbloqueioLegado": "Resp:"+res_data.codigoProtocolo+"-"+res_data.codigoSequenciaProtocolo,
                                   "dataHoraEXCCLegado": dt
                            }

                    
                     }catch( e){
                            retorno = {
                                   "codigoResposta": "ERRO",
                                   "descricaoReposta": "Erro "+e,
                                   "identificadorDesbloqueioLegado": "Erro:"+res_data.codigoProtoocolo+"-"+res_data.codigoSequenciaProtocolo,
                                   "dataHoraEXCCLegado": dt
                            }

                     }
              regLog('--------------------------------------');
              regLog(JSON.stringify(retorno))
              resp.status(200).send(retorno);
              regLog('--------------------------------------');
      }else{
             semAutorizacao(req, resp);
      }
});

app.post('/consultaSaldoBloqueado',
       (req, resp) => {

              if(hasAuthorization(req)){
                     regLog("- consultaSaldoBloqueado -------------------------");
                     const res_data = req.body;
                     let retorno=" ";
                     regLog("------------------------")
                     let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
                     try {
       
                            if(res_data.cnpjBaseSolicitacao===""){
                                   throw new Error(" cnpjBaseSolicitacao nao pode ser nula ")
                            }
                            if(res_data.tipoCliente.substring(0,1)!="F" &&
                                   res_data.tipoCliente.substring(0,1)!="J"){
                                          throw new Error('Tipo Cliente nao pode ser diferente de Fisica ou Jurica');
                            }
                            if(res_data.cpfCnpjRaizCliente===""){
                                   throw new Error(" cpfCnpjRaizCliente nao pode ser nula ")
                            }
                            let arrayContas=[]
                            let arrayBloqueios=[]
                            
                            for(let i=0;i<res_data.listaConta.length;i++){
                                   if(res_data.listaConta[i].numeroAgencia!=""){
                                          throw new Error(" numeroAgencia nao eh valida! "+res_data.listaConta[i].numeroAgencia)
                                   }
                                   const itemConta = {
                                          "numeroAgencia": res_data.listaConta[i].numeroAgencia,
                                          "numeroConta": res_data.listaConta[i].numeroConta,
                                          "valorSaldo": 100*i,
                                          "valorSaldoBloqueado": 100*i,
                                          "status": "Ok",
                                          "descricaoErro": ""
                                   }
                                   arrayContas.push(itemConta)
                                   const itemBloqueio = {
                                          "codigoProtocolo": "10203040-"+i,
                                          "codigoSequenciaProtocolo": "1",
                                          "cnpjBaseSolicitacao": "19019000119",
                                          "identificacadorLegado": "88888",
                                          "valorEfetivo": 10*i,
                                          "qtdeAtivosEfetivada": "1",
                                          "dataHoraEXCC": dt,
                                          "numeroDiasResgates": "0"
                                   }
                                   arrayBloqueios.push(itemBloqueio)
                            }
                            
                            regLog(" Data "+dt)
                            retorno = {
                                   "Contas": arrayContas,
                                   "Bloqueios":arrayBloqueios
                            }

       
                     }catch( e){
                            const vet = []
                            regLog("Erro "+e)
                            retorno = {
                                   "Contas": vet,
                                   "Bloqueios": vet,
                                   "Erro": ""+e
                            }
       
                     }
              regLog('--------------------------------------');
              regLog(JSON.stringify(retorno))
              resp.status(200).send(retorno);
              regLog('--------------------------------------');
       }else{
             semAutorizacao(req, resp);
       }
       
       })

app.post('/desbloquearSolicitacaoJudicial', 
(req, resp)=> {

       if(hasAuthorization(req)){
              regLog("- desbloquearSolicitacaoJudicial -------------------------");
              const res_data = req.body;
              let retorno=" ";
              let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
              try {

                     if(res_data.cnpjBaseSolicitacao===""){
                            throw new Error(" cnpjBaseSolicitacao nao pode ser nula ")
                     }
                     if(res_data.tipoCliente.substring(0,1)!="F" &&
                            res_data.tipoCliente.substring(0,1)!="J"){
                                   throw new Error('Tipo Cliente nao pode ser diferente de Fisica ou Jurica');
                     }
                     if(res_data.cpfCnpjRaizCliente==""){
                            throw new Error('cpfCnpjRaizCliente nao pode ser nullo');
                     }
                     if(res_data.numeroAgencia!=""){
                            throw new Error('Numero de agência nao pode ser diferente de nullo');
                     }
                     if(res_data.numeroConta==""){
                            throw new Error('numeroConta nao pode ser nullo');
                     }
                     if(res_data.codigoProtocolo==""){
                            throw new Error('codigoProtocolo nao pode ser nullo');
                     }
                     if(res_data.codigoSequenciaProtocolo==""){
                            throw new Error('codigoSequenciaProtocolo nao pode ser nullo');
                     }
                     if(res_data.codigoSequenciaDesbloqueioProtocolo==""){
                            throw new Error('codigoSequenciaDesbloqueioProtocolo nao pode ser nullo');
                     }
                     if(res_data.identificadorBloqueioLegado==""){
                            throw new Error('identificadorBloqueioLegado nao pode ser nullo');
                     }

                     if(res_data.indicadorValorTotal.substring(0,1)!="S" && 
                            res_data.indicadorValorTotal.substring(0,1)!="N"){
                            throw new Error('indicadorValorTotal deve ser Sim, ou Nou');
                     }

                     if(res_data.valorSolicitado<=0){
                            throw new Error('valorBloqueio tem que ser maior que zero');
                     }

       
                     regLog(" Data "+dt)
                     retorno = {
                            "codigoResposta": "OK",
                            "descricaoReposta": "Desbloqueio atendido",
                            "dataHoraEXCC": dt,
                            "identificadorDesbloqueioLegado": "Resp:"+res_data.codigoProtocolo+"-"+res_data.codigoSequenciaProtocolo,
                     }

             
              }catch( e){
                     retorno = {
                            "codigoResposta": "ERRO",
                            "descricaoReposta": "Erro no desbloqueio"+e,
                            "identificadorBloqueioLegado": "Erro:"+res_data.codigoProtoocolo+"-"+res_data.codigoSequenciaProtocolo,
                            "dataHoraEXCC": dt,
                            "identificadorDesbloqueioLegado": ""
                     }

              }
       regLog('--------------------------------------');
       regLog(JSON.stringify(retorno))
       resp.status(200).send(retorno);
       regLog('--------------------------------------');
}else{
      semAutorizacao(req, resp);
}
});

app.post('/notificar', 
(req, resp)=> {

       if(hasAuthorization(req)){
              regLog("- notificar -------------------------");
              const res_data = req.body;
              let retorno=" ";
              let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
              try {
                     regLog(" Data "+dt)
                     regLog(JSON.stringify(res_data))
                     retorno = {
                            "codigoRetorno": 200,
                            "descricaoMensagemRetorno": "OK"
                     }

             
              }catch( e){
                     retorno = {
                            "codigoRetorno": 400,
                            "descricaoMensagemRetorno": "Erro:"+e.Error
                     }

              }
       regLog('--------------------------------------');
       regLog(JSON.stringify(retorno))
       resp.status(200).send(retorno);
       regLog('--------------------------------------');
}else{
      semAutorizacao(req, resp);
}
});

app.get('/confirmarOperacao', 
(req, resp)=> {

       if(hasAuthorization(req)){
              regLog("- confirmarOperacao -------------------------");
              // const res_data = req.body;
              let retorno=" ";
              let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
              try {
                     regLog(" Data "+dt)
                     regLog(JSON.stringify(req))
                     retorno = {
                            "retornoConfirmacao": 0
                     }

             
              }catch( e){
                     retorno = {
                            "retornoConfirmacao": 1
                     }

              }
       regLog('--------------------------------------');
       regLog(JSON.stringify(retorno))
       resp.status(200).send(retorno);
       regLog('--------------------------------------');
}else{
      semAutorizacao(req, resp);
}
});



chamarDetalhes=( protocolo , hasMsg )=>{
       const localToken = getToken()
       regLog("::Prot:"+protocolo+" hash"+hasMsg)
       let obj = undefined
       try {
              const servidor=servidorOrigem+
                     '/v1/atacado/operacional/consultar-detalhes-notificacao/obter'
              const msgLocal = {
                     "codigoIdentificacaoFintech": 6234,
                     "numeroCNPJFintech": '06234797000114',
                     "hashMensagem": hasMsg,
                     "protocolo": protocolo
              }
              regLog("Token:"+servidor+ " Body:"+JSON.stringify(msgLocal))
              
              var res = request('POST', servidor, {
                     headers: {
                            "Authorization": localToken.token_type+' '+localToken.access_token
                     },
                     json: msgLocal
              });
              regLog('==>'+res.getBody())
              obj = JSON.parse(res.getBody())
              
       }catch(e){
              regLog('Erro Chamada Busca '+e.Error)
       }
       return obj
}

app.post('/v2/notificar', 
(req, resp)=> {

       if(hasAuthorization(req)){
              regLog("- notificar -------------------------");
              regLog(JSON.stringify(req.body))
              const res_data = req.body
              let retorno=" ";
              let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
              try {
                     regLog(" Data "+dt)
                     regLog(JSON.stringify(res_data))
                     retorno = {
                            "codigoRetorno": 200,
                            "descricaoMensagemRetorno": "OK"
                     }

             
              }catch( e){
                     retorno = {
                            "codigoRetorno": 400,
                            "descricaoMensagemRetorno": "Erro:"+e.Error
                     }

              }
              regLog("1")
              try {
                     regLog("2")
                     let resChamada=undefined
                     regLog('='+res_data.evento+'-'+res_data.protocolo+"="+res_data.hashMensagem)
                     //if(res_data.evento==='1'){
                            regLog("Evento 1")
                            resChamada= chamarDetalhes(res_data.protocolo, 
                                                        res_data.hashMensagem)
                            regLog('Retorno chamada!'+JSON.stringify(resChamada))
                     //} else {
                     //       log.console("Evento "+res_data.evento+" sem chamada!")
                     //}
              }catch(e){
                     retorno = {
                            "codigoRetorno": 501,
                            "descricaoMensagemRetorno": "Erro:"+e.Error
                     }

              }
       regLog('--------------------------------------');
       regLog(JSON.stringify(retorno))
       resp.status(200).send(retorno);
       regLog('--------------------------------------');
}else{
      semAutorizacao(req, resp);
}
});

getToken=()=>{
       if(token2==undefined){
       try {
              const servidor=servidorOrigem+
                     '/auth/oauth/v2/token'
              const msgLocal = {
                     "client_id": 'l7xx0f606c6aa7bd4b1286ebb035e5d2cda1',
                     "client_secret": '73f7b04f554c4a9aac366830df526ffa',
                     "grant_type": "client_credentials"
              }
              regLog("Token:"+servidor+ " Body:"+JSON.stringify(msgLocal))
              
              var res = request('POST', servidor, {
                     json: msgLocal,
              });
              regLog('==>'+res.getBody())
              let obj = JSON.parse(res.getBody())
              token2 = obj;
       }catch(e){
              regLog('Erro getToken '+e.Error)
              token2=undefined
       }}
       return token2;
}


/**
 * Funcionalidade para bloqueio e desbloqueio via sistema SPAG
 */
app.post('/bloquearDesbloquearContaViaSpag', 
              (req, resp)=> {
                     
                     if(hasAuthorization(req)){
                            regLog("Result ");
                            regLog(req.body);
                            regLog("--------------------------");
                            const res_data = req.body;

                           let retorno=" ";
                           try {
                                  try {
                                         if(res_data.codigoStatusRelacionamentoConta!=1){
                                                if(res_data.codigoStatusRelacionamentoConta!=2){
                                                       throw new Error('Status do relacionamento nao pode ser diferente de 1 ou 2!');
                                                }
                                         }
                                  } catch(e){
                                         throw new Error('É obrigatório informar codigoStatusRelacionamentoConta!'+e);
                                  }
                                  try {
                                         if(res_data.descricaoMotivoBloqueioDesbloqueio.length===0){
                                           throw new Error('É obrigatório informar descricaoMotivoBloqueioDesbloqueio!');
                                         }
                                  } catch(e){
                                          throw new Error('É obrigatório informar descricaoMotivoBloqueioDesbloqueio!')
                                  }
                                  try {
                                          if(res_data.numeroConta.length===0){
                                                 throw new Error('É obrigatorio informar o numero da conta!');
                                          }
                                   } catch(e){
                                          throw new Error('E obrigatorio informar o numero da conta ');            
                                   }
                                 
                                   const numRandom = require('crypto').createHash('md5').update(Math.random().toString()).digest('hex');
                                   retorno = '{ "numeroProtocoloConfirmacaoBloqueioDesbloqueio": "'+numRandom+'", "confirmacaoDePedidoBloqueioDesbloqueio": "OK","descricaoMensagemRetorno": "Blocked/Unblocked" } ';                                   
                                   reglog(" Agencia/Conta: "+res_data.numeroAgencia+" / "+res_data.numeroConta);
                                   reglog(" Status:        "+res_data.codigoStatusRelacionamentoConta);
                                   reglog(" Motivo:        "+res_data.descricaoMotivoBloqueioDesbloqueio);
                                   reglog(" Data:          "+res_data.dataInicio);
                                   reglog(" URLParceiro:   "+res_data.urlParceiro);
                                   reglog(" Usuario:       "+res_data.nomeParceiroServico);
                                   reglog(" Response:     "+retorno);
                                   reglog('--------------------------------------');
                                   resp.status(200).send(retorno);
                                   regLog('--------------------------------------');
                                   
                            }catch( e){
                                   retorno = '{ "numeroProtocoloConfirmacaoBloqueioDesbloqueio": "NOK", "confirmacaoDePedidoBloqueioDesbloqueio": "NOK","descricaoMensagemRetorno": "Erro: '+e+'" } ';                     
                                   resp.status(200).send(retorno);

                            }
                     }else{
                            semAutorizacao(req, resp);
                     }
              }
              );

app.post('/solicitarTransferenciaJudicial', 
(req, resp)=> {

       if(hasAuthorization(req)){
              regLog("- solicitarTransferenciaJudicial -------------------------");
              const res_data = req.body;
              let retorno=" ";
              let dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
              try {

                     if(res_data.cnpjBaseSolicitacao===""){
                            throw new Error(" cnpjBaseSolicitacao nao pode ser nula ")
                     }
                     if(res_data.tipoCliente.substring(0,1)!="F" &&
                            res_data.tipoCliente.substring(0,1)!="J"){
                                   throw new Error('Tipo Cliente nao pode ser diferente de Fisica ou Jurica');
                     }
                     if(res_data.cpfCnpjRaizCliente==""){
                            throw new Error('cpfCnpjRaizCliente nao pode ser nullo');
                     }
                     if(res_data.numeroAgencia!=""){
                            throw new Error('Numero de agência nao pode ser diferente de nullo');
                     }
                     if(res_data.numeroConta==""){
                            throw new Error('numeroConta nao pode ser nullo');
                     }
                     if(res_data.codigoProtocolo==""){
                            throw new Error('codigoProtocolo nao pode ser nullo');
                     }
                     if(res_data.identificadorBloqueioLegado==""){
                            throw new Error('identificadorBloqueioLegado nao pode ser nullo');
                     }
                     if(res_data.numeroBancoDestino==""){
                            throw new Error('numeroBancoDestino nao pode ser nullo');
                     }
                     if(res_data.numeroAgenciaDestino==""){
                            throw new Error('numeroAgenciaDestino nao pode ser nullo');
                     }
                     if(res_data.numeroContaDestino=""){
                            throw new Error('numeroContaDestino nao pode ser nullo');
                     }
                     if(res_data.cpfCnpjFavorecido=""){
                            throw new Error('cpfCnpjFavorecido nao pode ser nullo');
                     }
                     if(res_data.tipoPessoaFavorecido=""){
                            throw new Error('tipoPessoaFavorecido nao pode ser nullo');
                     }

                     if(res_data.valorTransferencia<=0){
                            throw new Error('valorBloqueio tem que ser maior que zero');
                     }

                     if(res_data.identificadorTransferencia=""){
                            throw new Error('identificadorTransferencia nao pode ser nullo');
                     }
                     if(res_data.sequenciaTransferencia=""){
                            throw new Error('sequenciaTransferencia nao pode ser nullo');
                     }
                     if(res_data.numeroProcesso=""){
                            throw new Error('numeroProcesso nao pode ser nullo');
                     }
                     if(res_data.cpfCnpjDestino=""){
                            throw new Error('cpfCnpjDestino nao pode ser nullo');
                     }


       
                     regLog(" Data "+dt)
                     retorno = {
                            "codigoResposta": "OK",
                            "descricaoReposta": "Transferencia aceita",
                            "dataHoraEXCC": dt,
                            "identificadorSolicitacaoLegado": "Resp:"+res_data.codigoProtocolo+"-"+res_data.identificadorTransferencia,
                     }

             
              }catch( e){
                     retorno = {
                            "codigoResposta": "ERRO",
                            "descricaoReposta": "Erro no Transferencia."+e,
                            "identificadorSolicitacaoLegado": "Erro:"+res_data.codigoProtoocolo+"-"+res_data.identificadorTransferencia,
                            "dataHoraEXCC": dt,
                            "identificadorDesbloqueioLegado": ""
                     }

              }
       regLog('--------------------------------------');
       regLog(JSON.stringify(retorno))
       resp.status(200).send(retorno);
       regLog('--------------------------------------');
}else{
      semAutorizacao(req, resp);
}
});


app.listen(port, ()=>{
       regLog("Listem "+port)
});

app.get('/visualizaLogs', 
(req, resp)=> {
       /*
       if(hasAuthorization(req)){
              regLog("/usuarios");
              resp.status(200).send(usuarios);
       }else{
              semAutorizacao(req, resp);
       }
       */
      var texto="<!DOCTYPE html>"
      texto+='<title>Logs</title>'
      texto+='      <meta charset="UTF-8">'
      texto+='<meta name="viewport" content="width=device-width, initial-scale=1">'
      texto+='<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">'
      texto+='<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">'
      texto+='<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">'
      texto+='<style>'
      texto+='.body {font-family: "Lato", sans-serif}'
      texto+='.mySlides {display: none}'
      texto+='</style> <Body>'
      texto += '  <div class="w3-container w3-content w3-center w3-padding-64" style="max-width:800px" id="band">'
      texto += '<h2 class="w3-wide">LOG</h2>'

      for(var i = ultimos100logs.length-1;i>=0;i--){
              texto += '<p class="w3-justify">'+ultimos100logs[i]+'</p>'
      }
      texto += '</body>  </html>';
      resp.status(200).send(texto);
}
);
