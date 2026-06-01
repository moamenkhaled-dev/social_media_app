import { redisService } from "../common/services/redis.service.js";
import { connectDB } from "../infra/database/connect.database.js";
import { WorkerManager } from "./worker.manager.js";

await connectDB();
await redisService.connect();

const manager = new WorkerManager();

manager.start();
