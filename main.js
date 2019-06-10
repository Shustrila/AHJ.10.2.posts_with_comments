import http from 'http';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-body';
import koaCors from 'koa-cors';
import faker from 'faker';
import moment from 'moment';

const app = new Koa();
const router =new KoaRouter();
const port = process.env.PORT || 7070;

app.use(koaCors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']
}));
app.use(koaBody({ urlencoded: true }));

const authorID = [];

router.get('/posts/latest' , async (ctx, next) => {
    let data = {};
    data.status = "ok";
    data.timestamp = new Date();
    data.messages = [];

    for (let i = 0; i < 10; i++) {
        let push = {};
        const date = moment(faker.date.past());

        push['id'] = faker.random.uuid();
        push['author_id'] = faker.random.uuid();
        push['title'] = faker.name.title();
        push['author'] = faker.finance.accountName();
        push['avatar'] = faker.image.avatar();
        push['image'] = faker.random.image();
        push['created'] = date.format('hh:mm DD.MM.YYYY');

        authorID.push(push['id']);
        data.messages.push(push);
    }

    ctx.response.body = data;

    await next();
});

router.get('/posts/:id/comments/latest' , async (ctx, next) => {
    const id = String(ctx.params.id);
    let data = {};

    console.log(authorID);

    if (authorID.indexOf(id) >= 0) {
        const numberComments = Number(Math.floor(Math.random() * 4));

        data.status = "ok";
        data.data = [];

        for (let i = 0; i < numberComments; i++) {
            let push = {};
            const date = moment(faker.date.past());

            push['id'] = faker.random.uuid();
            push['post_id'] = faker.random.uuid();
            push['author_id'] = faker.random.uuid();
            push['author'] = faker.finance.accountName();
            push['avatar'] = faker.image.avatar();
            push['image'] = faker.random.image();
            push['created'] = date.format('hh:mm DD.MM.YYYY');

            data.data.push(push);
        }
    } else {
        data.status = "error";
    }

    ctx.response.body = data;

    await next();
});



app.use(router.routes());

http.createServer(app.callback()).listen(port);
