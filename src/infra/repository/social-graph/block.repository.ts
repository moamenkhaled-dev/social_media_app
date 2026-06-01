import type { IBlock } from "../../../common/interfaces/block.interface.js";
import { Block } from "../../database/models/block.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class BlockRepository extends DataBaseRepository<IBlock>{
    constructor(){
        super(Block)
    }
}