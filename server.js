const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');

const app = new Koa();

app.use(koaBody({urlencoded: true}));

app.use((ctx, next) => {
  console.log(ctx.request.body);

  ctx.response.body = 'server response';

  next();
});

app.use((ctx) => {
  console.log('I am a second middleware');
});

const server = http.createServer(app.callback());

const port = 7070;
// слушаем определённый порт
server.listen(port, (err) => {
    if (err) {
      console.log('Error occured:', err);
      return; 
    }
    console.log(`server is listening on ${port}`);
});
