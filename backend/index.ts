import * as express from 'express';
import * as bodyParser from 'body-parser';
import { graphRouter } from './routers/graph';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
  res.send('api works');
})


app.get('**', (req, res) => {
  res.send('hello world');
})

app.use('/api', graphRouter);

const port = 3000;

app.listen(port, () => {
  console.log(`Listen on ${port}`);
})
