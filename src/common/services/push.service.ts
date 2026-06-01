import admin from "firebase-admin";
import type { BatchResponse } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FIRE_BASE_CONFIG } from "../../config/config.js";

class PushService {
  private client: admin.app.App;

  constructor() {
    const serviceAccount = JSON.parse(
      readFileSync(resolve(FIRE_BASE_CONFIG), "utf-8"),
    );
    this.client = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  }

  //send notification
  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }): Promise<string> {
    const message = { token, data };

    return await this.client.messaging().send(message);
  }

  //send multiple notifications
  async sendMultipleNotifications({
    tokens,
    title,
    body,
  }: {
    tokens: Array<string>;
    title: string;
    body: string;
  }): Promise<{
    responses: Array<BatchResponse>;
    successCount: number;
    failureCount: number;
  }> {
    const chunks = this.chunkArray(tokens, 500);

    const responses = await Promise.all(
      chunks.map((chunk) => {
        return this.client.messaging().sendEachForMulticast({
          tokens: chunk,
          data: {
            title,
            body,
          },
        });
      }),
    );
    const successCount = responses.reduce((acc, res) => {
      return acc + res.successCount;
    }, 0);

    const failureCount = responses.reduce((acc, res) => {
      return acc + res.failureCount;
    }, 0);

    return { responses, successCount, failureCount };
  }
}
export const pushService = new PushService();
