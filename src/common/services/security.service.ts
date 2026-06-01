import bcrypt from "bcrypt";
import { ROUNDS } from "../../config/config.js";

class SecurityService {
  constructor() {}

  //hash
  async hash({
    data,
    rounds = ROUNDS,
  }: {
    data: string;
    rounds?: number;
  }): Promise<string> {
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(data, salt);
  }

  //compare
  async compare({
    data,
    encrypted,
  }: {
    data: string;
    encrypted: string;
  }): Promise<boolean> {
    return await bcrypt.compare(data, encrypted);
  }
}

export const securityService = new SecurityService();
