import { body, param } from "express-validator";

const transferCreateValidation = [
  body("accessionNumber")
    .notEmpty()
    .withMessage("Accession Number is required"),
  body("applicationNumber")
    .notEmpty()
    .withMessage("Application Number is required"),
  body("description").optional(),
];

const transferUpdateValidation = [
  param("transferId").exists().isMongoId(),
  body("accessionNumber")
    .notEmpty()
    .withMessage("Accession Number is required"),
  body("applicationNumber")
    .notEmpty()
    .withMessage("Application Number is required"),
  body("description").optional(),
];

export { transferCreateValidation, transferUpdateValidation };
