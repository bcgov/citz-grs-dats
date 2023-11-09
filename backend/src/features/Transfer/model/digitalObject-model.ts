import { model, Schema, Model, Document } from "mongoose";

import { IDigitalObject } from "dats_shared/Types/interfaces/IDigitalObject";

const DigitalObjectSchema: Schema = new Schema<IDigitalObject>({
  title: { type: String },
  description: { type: String },
  data: { type: Buffer }, // This is the field for storing binary data (BLOB)
  contentType: { type: String }, //  store the content type, e.g., 'image/jpeg', 'application/pdf', etc.
  digitalFileList: {
    type: Schema.Types.ObjectId,
    ref: "DigitalFileList",
  },
});
export const DigitalObjectModel: Model<IDigitalObject> = model<IDigitalObject>(
  "DigitalObject",
  DigitalObjectSchema
);
export { IDigitalObject };
