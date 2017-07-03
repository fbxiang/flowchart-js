import * as express from 'express';
import * as graphService from '../service/graph';

export const graphRouter = express.Router();

graphRouter.post('/graph', (req, res) => {
  if (!req.body)
    return res.status(400).send('no graph received');
  try {
    graphService.setGraph(req.body);
  } catch (e) {
    return res.status(400).send(e);
  }
  res.send('graph successfully creaated');
})

graphRouter.post('/graph/state', (req, res) => {
  res.send(graphService.graph._execution_meta);
})
