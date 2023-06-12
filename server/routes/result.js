import { Router } from 'express';
import OperationHandler from '../handler';
import fs from 'fs';
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const router = Router();

const pathPrefixTwitter = '../results/twitter/';
const pathPrefixDataset = '../results/dataset/';
router.get('/id/:id', async (req, res) => {
    let operation = await OperationHandler.findById(req.params.id);
    if (operation == null){
        return res.send(null);
    }
    console.log(operation);
    console.log(operation[0].sent_path);
    return res.json(fs.readFileSync( pathPrefixTwitter + operation[0].sent_path, 'utf8'));
});

router.get('/word/id/:id', async (req, res) => {
    let operation = await OperationHandler.findById(req.params.id);
    if (operation == null){
        return res.send(null);
    }   
    console.log(operation);
    console.log(operation[0].wcloud_path);
    return res.json(fs.readFileSync(pathPrefixTwitter + operation[0].wcloud_path, 'utf8'));
});

router.get('/dt/id/:id', async (req, res) => {
    try {
      let operation = await OperationHandler.findByIdDt(req.params.id);
      if (!operation) {
        return res.send(null);
      }
      console.log(operation);
      console.log(operation[0].sent_path);
  
      const data = await readFileAsync(pathPrefixDataset + operation[0].sent_path, 'utf8');
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error reading file');
    }
  });
  
  router.get('/dt/word/id/:id', async (req, res) => {
    try {
      let operation = await OperationHandler.findByIdDt(req.params.id);
      if (!operation) {
        return res.send(null);
      }
      console.log(operation);
      console.log(operation[0].wcloud_path);
  
      const data = await readFileAsync(pathPrefixDataset + operation[0].wcloud_path, 'utf8');
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error reading file');
    }
  });
  
  

router.get('/query/:query', async (req, res) => {
    let operation = await OperationHandler.findByQuery(req.params.query);
    if (operation.length <= 0){
        return res.send(null);
    }
    return res.json(fs.readFileSync(pathPrefixTwitter + operation[0].result_path, 'utf8'));
});

router.get('/volume/id/:id', async (req, res) => {
    let operation = await OperationHandler.findById(req.params.id);
    if (operation == null){
        return res.send(null);
    }
    return res.json(fs.readFileSync(pathPrefixTwitter + operation.volume_path, 'utf8'));
});

router.get('/volume/query/:query', async (req, res) => {
    let operation = await OperationHandler.findByQuery(req.params.query);
    if (operation.length <= 0){
        return res.send(null);
    }
    return res.json(fs.readFileSync(pathPrefixTwitter + operation[0].volume_path, 'utf8'));
});

export default router;