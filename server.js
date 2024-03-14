const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const uuid = require('uuid');
const querystring = require('node:querystring'); 

const app = new Koa();

const tickets = [
  {
    id: uuid.v4(),
    name: "Задание 1",
    description: "Полное описание задания 1",
    status: 1,
    created: "10.04.24 10:00",
  },
  {
    id: uuid.v4(),
    name: "Задание 2",
    description: "Полное описание задания 2",
    status: 0,
    created: "11.04.24 12:00",
  },
  {
    id: uuid.v4(),
    name: "Задание 4",
    description: "Полное описание задания 4",
    status: 0,
    created: "13.04.24 14:00",
  },
];

app.use(koaBody({ urlencoded: true }));

app.use((ctx, next) => {
  if (ctx.request.method !== "OPTIONS") {
    next();

    return;
  }

  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
  ctx.response.set('Access-Control-Allow-Headers', "Content-Type");

  ctx.response.status = 204;
});

app.use((ctx, next) => {

  console.log(ctx.request.body);
  console.log(ctx.request.querystring);

  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Content-Type', "application/json; charset=utf-8");

  const queryParams = querystring.parse(ctx.request.querystring);
  switch (queryParams.method) {
    case 'allTickets':
      ctx.response.body = JSON.stringify(tickets);
      return;
    // TODO: обработка остальных методов
    case 'ticketById':
      const ticket = Array.from(tickets).find((el) => {
        return el.id == queryParams.id;
      });
      if (ticket) {
        ctx.response.body = JSON.stringify(ticket);  
      } else {
        ctx.response.status = 404;
      }
      return;
    case 'createTicket':
      const {name, description} = ctx.request.body;
      console.log(ctx.request.body);
      console.log(`name: ${ctx.request.body.name}, description: ${ctx.request.body.description}`);
      return;
    default:
      ctx.response.status = 404;
      return;
  }

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
