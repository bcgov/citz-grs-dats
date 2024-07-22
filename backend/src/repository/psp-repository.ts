import { model, ObjectId } from "mongoose";
import { IPsp } from "../models/interfaces/IPsp";
import { PspModel } from "../models/psp-model";

export default class PspRepository {
    async createPsp(pspData: Partial<IPsp>): Promise<IPsp> {
        const psp = new PspModel(pspData);
        return await psp.save();
    }
    async getPspById(id: string): Promise<IPsp | null> {
        try {
            const psp = await PspModel.findById(id);
            return psp;
        } catch (error) {
            console.error(`Error occurred while getting PSP by ID: ${error}`);
            return null;
        }
    }
    async getPspByName(name: string): Promise<IPsp | null> {
        try {
            const psp = await PspModel.findOne({ name: name });
            return psp;
        } catch (error) {
            console.error(`Error occurred while getting PSP by name: ${error}`);
            return null;
        }
    }

}
