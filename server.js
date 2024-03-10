const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const uuid = require('uuid');

const app = new Koa();

const tickets = [];

app.use(koaBody({ urlencoded: true }));

app.use((ctx, next) => {
  if (ctx.request.method !== "OPTIONS") {
    next();

    return;
  }

  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');

  ctx.response.status = 204;
});

app.use((ctx, next) => {
  console.log(ctx.request.body);

  const { method } = ctx.request.querystring;

  ctx.response.set('Access-Control-Allow-Origin', '*');

  switch (method) {
    case 'allTickets':
      ctx.response.body = tickets;
      return;
        // TODO: обработка остальных методов
    case 'createTicket':
      return;
    default:
      ctx.response.status = 404;
      return;
    }


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
