import { Router } from 'express';
import OperationHandler from '../handler';
const router = Router();


router.get("/", async (req,res) => {
    const results = await OperationHandler.getAll();
    return res.send(results);
});

router.get("/dt", async (req,res) => {
    const results = await OperationHandler.getAllDt();
    return res.send(results);
});

router.get("/id/:id", async (req,res) => {
    const results = await OperationHandler.findById(req.params.id);
    return res.send(results);
});
router.get("dt/id/:id", async (req,res) => {
    const results = await OperationHandler.findByIdDt(req.params.id);
    return res.send(results);
});
router.get("/query/:query",async (req,res) => {
    const results = await OperationHandler.findByQuery(req.params.query);
    res.send(results);
});

router.get('/completed', async (req, res) => {
    const operation = await OperationHandler.getAllCompleted();
    return res.send(operation);
}); 

router.post('/start', async (req,res) => {
    try {
        const operation = await OperationHandler.startOperation(req.body);
        return res.json({operation});
    } catch(error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

router.post('/dt/start', async (req, res) => {
  try {
    const operation = await OperationHandler.startDtOperation(req.body);
    return res.json({operation});
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default router;