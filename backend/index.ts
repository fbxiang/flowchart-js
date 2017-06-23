import * as express from 'express';

const app = express();

app.get('/api', (req, res) => {
  res.send('api works');
})


app.get('**', (req, res) => {
  res.send('hello world');
})

const port = 3000;

app.listen(port, () => {
  console.log(`Listen on ${port}`);
})
