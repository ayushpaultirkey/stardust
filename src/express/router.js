import express from "express";
import Create from "./controller/node/create.js";
import Fetch from "./controller/node/fetch.js";
import Count from "./controller/node/count.js";

const router = express.Router();

router.use("/api/node/create", Create);
router.use("/api/node/fetch", Fetch);
router.use("/api/node/count", Count);

export default router;