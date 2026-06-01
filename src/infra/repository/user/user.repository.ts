import type {
  IUser,
  IUserMethod,
} from "../../../common/interfaces/user.interfaces.js";
import { User } from "../../database/models/user.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class UserRepository extends DataBaseRepository<IUser, IUserMethod> {
  constructor() {
    super(User);
  }
}
