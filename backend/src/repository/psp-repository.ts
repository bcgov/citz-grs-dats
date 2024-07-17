import { model } from "mongoose";
import { IPsp } from "../models/interfaces/IPsp";
import { IPspModel } from "../models/psp-model";

export default class PspRepository {
    async createPsp(pspData: Partial<IPsp>): Promise<IPsp> {
        const psp = new IPspModel(pspData);
        return await psp.save();
    }

}
