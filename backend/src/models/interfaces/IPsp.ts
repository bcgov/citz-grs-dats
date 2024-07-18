import { Document, Schema, Types } from "mongoose";

export interface IPsp extends Document {
    name: string;
    pathToS3?: string;
    pathToLan?: string;
    pspStatus: 'To be Create' | 'Create';
    transfer: {
        type: Schema.Types.ObjectId;
        ref: "Transfer";
    };
}