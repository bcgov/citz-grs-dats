import { model, Schema, Model } from "mongoose";
import { IPsp } from "./interfaces/IPsp";

const PspSchema: Schema = new Schema<IPsp>({
    name: { type: String, required: true },
    pathToS3: { type: String, required: false },
    pathToLan: { type: String, required: false },
    pspStatus: {
        type: String,
        enum: ['To be Create', 'Create'],
        default: 'To be Create',
    },
    transfer: {
        type: Schema.Types.ObjectId,
        ref: "Transfer",
    },
});

export const IPspModel: Model<IPsp> = model<IPsp>("Psp", PspSchema);
export { IPsp };
