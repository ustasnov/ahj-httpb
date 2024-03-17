/* eslint-env node */
/* eslint no-unused-vars: "off" */

const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body");
const uuid = require("uuid");
const querystring = require("node:querystring");
const fs = require("fs");

const app = new Koa();

let tickets = [];

const dataFileName = "./public/data.json";

function saveData() {
  const stringData = JSON.stringify(tickets);
  fs.writeFileSync(
    dataFileName,
    stringData,
    (err) => {
      if (err) {
        throw new Error(`Error occured: ${err}`);
      }
    },
    { encoding: "utf8", flag: "w" }
  );
  console.log("data save to file");
}

function loadData() {
  const stringData = fs.readFileSync(dataFileName, {
    encoding: "utf8",
    flag: "r",
  });
  tickets = JSON.parse(stringData);
  console.log("data load from file");
}

function getCurrentDateString() {
  const options = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const currentDate = new Date();
  return currentDate.toLocaleString("ru", options).replace(",", "");
}

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
  })
);

app.use((ctx, next) => {
  if (ctx.request.method !== "OPTIONS") {
    next();

    return;
  }

  ctx.response.set("Access-Control-Allow-Origin", "*");
  ctx.response.set(
    "Access-Control-Allow-Methods",
    "DELETE, PUT, PATCH, GET, POST"
  );
  ctx.response.set("Access-Control-Allow-Headers", "Content-Type");
  ctx.response.set("Content-Type", "application/json; charset=utf-8");

  ctx.response.status = 204;
});

app.use((ctx, next) => {
  if (ctx.request.method !== "DELETE") {
    next();

    return;
  }

  ctx.response.set("Access-Control-Allow-Origin", "*");

  const queryParams = querystring.parse(ctx.request.querystring);
  console.log(ctx.request.querystring);
  if (queryParams.method == "deleteTicket") {
    const { id } = ctx.request.query;
    const deletedTicket = Array.from(tickets).find((el) => el.id == id);
    let deleteId = id;
    if (deletedTicket) {
      deleteId = deletedTicket.id;
      tickets.splice(tickets.indexOf(deletedTicket), 1);
      saveData();
    } else {
      console.log(`ticket for delete with id = ${id} not found`);
    }
    ctx.response.body = JSON.stringify({ result: 0, data: deleteId });
  } else {
    ctx.response.status = 404;
    return;
  }
});

app.use((ctx, next) => {
  ctx.response.set("Access-Control-Allow-Origin", "*");

  const queryParams = querystring.parse(ctx.request.querystring);
  console.log(ctx.request.querystring);
  console.log(queryParams);
  let ticket = null;
  let id = "",
    name = "",
    description = "",
    status = 0;
  switch (queryParams.method) {
    case "allTickets":
      loadData();
      ctx.response.body = JSON.stringify({ result: 0, data: tickets });
      return;
    case "ticketById":
      ticket = Array.from(tickets).find((e) => e.id == queryParams.id);
      if (ticket) {
        ctx.response.body = JSON.stringify({ result: 0, data: ticket });
      } else {
        console.log(`ticket with id = ${queryParams.id} not found`);
        ctx.response.body = JSON.stringify({ result: 1, data: {} });
      }
      return;
    case "createTicket":
      console.log(
        `name: ${ctx.request.body.name}, description: ${ctx.request.body.description}`
      );
      ticket = {
        id: uuid.v4(),
        name: ctx.request.body.name,
        description: ctx.request.body.description,
        status: 0,
        created: getCurrentDateString(),
      };
      tickets.push(ticket);
      saveData();
      ctx.response.body = JSON.stringify({ result: 0, data: ticket });
      return;
    case "updateTicket":
      ({ id, name, description, status } = ctx.request.body);
      console.log(
        `name: ${ctx.request.body.name}, description: ${ctx.request.body.description}`
      );
      ticket = Array.from(tickets).find((el) => el.id == id);
      if (ticket) {
        ticket.name = name;
        ticket.description = description;
        ticket.status = status;
        saveData();
        ctx.response.body = JSON.stringify({ result: 0, data: ticket });
      } else {
        console.log(`ticket with id = ${id} not found`);
        ctx.response.body = JSON.stringify({ result: 1, data: {} });
      }
      return;
    case "toggleTicketStatus":
      ticket = Array.from(tickets).find((el) => el.id == ctx.request.body.id);
      if (ticket) {
        ticket.status = ticket.status == 0 ? 1 : 0;
        saveData();
        ctx.response.body = JSON.stringify({ result: 0, data: ticket });
      } else {
        console.log(`ticket with id = ${ctx.request.body.id} not found`);
        ctx.response.body = JSON.stringify({ result: 1, data: {} });
      }
      return;
    default:
      ctx.response.status = 404;
      return;
  }
});

const server = http.createServer(app.callback());

const port = 7070;
server.listen(port, (err) => {
  if (err) {
    console.log("Error occured:", err);
    return;
  }
  console.log(`server is listening on ${port}`);
});
