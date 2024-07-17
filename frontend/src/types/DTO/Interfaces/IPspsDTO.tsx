export interface IPspsDTO {
    _id: string;
    name: string;
    pathToS3?: string;
    pathToLan?: string;
    pspStatus: {
        enum: ['To be Create', 'Create']
    },
    createdBy?: string;
    updatedBy?: string;
    timestamps?: {};
}