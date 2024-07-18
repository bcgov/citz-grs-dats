import { model, ObjectId } from "mongoose";
import { IPsp } from "../models/interfaces/IPsp";
import { IPspModel } from "../models/psp-model";

export default class PspRepository {
    async createPsp(pspData: Partial<IPsp>): Promise<IPsp> {
        const psp = new IPspModel(pspData);
        return await psp.save();
    }
    async getPspById(id: string): Promise<IPsp | null> {
        try {
            const psp = await IPspModel.findById(id);
            return psp;
        } catch (error) {
            console.error(`Error occurred while getting PSP by ID: ${error}`);
            return null;
        }
    }

}
