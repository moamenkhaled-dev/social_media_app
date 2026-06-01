import { Server } from "socket.io";

import { BadRequestError } from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { tokenService } from "../../common/services/token.service.js";
import type { IAuthSocket } from "../../common/types/socket.js";
import type { Server as HttpServer } from "node:http";
import { ORIGINS } from "../../config/config.js";
import { chatGateWay } from "../chat/index.js";

class RealtimeGateWay {
  private io!: Server;
  private readonly tokenService = tokenService;
  private readonly redis = redisService;
  private readonly chatGateWay = chatGateWay;
  public get getIo(): Server {
    return this.io;
  }

  //authentication
  private authentication = async (socket: IAuthSocket, next: any) => {
    try {
      const authorization: string =
        socket.handshake.auth.authorization ||
        socket.handshake.headers.authorization;
      if (!authorization) {
        throw new BadRequestError(`No token passed`);
      }
      const [flag, token] = authorization.split(" ");
      if (!token) {
        throw new BadRequestError(`No token passed`);
      }
      const { user, decode } = await this.tokenService.authenticateToken({
        token: token,
      });
      socket.data = { user, decode };
      const key = this.redis.socketKey(user._id);
      await this.redis.sAdd({ key, members: [socket.id] });

      next();
    } catch (error) {
      next(error);
    }
  };

  //initialize io
  async initializeIO(httpServer: HttpServer): Promise<void> {
    this.io = new Server(httpServer, {
      cors: {
        origin: ORIGINS,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this.io.of("/").use(this.authentication);
    this.io.on("connection", (socket: IAuthSocket) => {
      //chat gateway
      this.chatGateWay.registerEvents(socket, this.io);
      socket.on("disconnect", async () => {
        const socketKey = this.redis.socketKey(socket.data.user._id);
        await this.redis.sRem({ key: socketKey, members: socket.id });
        socket.data.currentChat = null;

        // const connections = await this.redis.sMembers(key);
        // if (connections.length === 0) {
        //   //TODO : handle online status of user
        // }
      });
    });
  }
}

export const realtimeGateWay = new RealtimeGateWay();
