import type { IInvitation } from "../../../common/interfaces/invitation.interface.js";
import { Invitation } from "../../database/models/invitation.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class InvitationRepository extends DataBaseRepository<IInvitation> {
  constructor() {
    super(Invitation)
  }
}
