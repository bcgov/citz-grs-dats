import { RequestHandler } from "express";
import { TransferService } from "../service/transfer-service";
import extractsFromAra66x from "./utils/extractsFromAra66x";

class UploadController {
  // Constructor to initialize any properties or perform setup
  private transferService: TransferService;
  constructor() {
    // Initialize any properties or perform setup here if needed
    this.transferService = new TransferService();
  }
  handleARIS66xUpload: RequestHandler = async (req, res, next) => {
    try {
      // Handle the uploaded files here (e.g., save to the database)
      const uploadedFile = req.file;

      if (!uploadedFile) {
        // Handle the case where the file is not present
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = uploadedFile.path; // Assuming the path is in 'path' property

      console.log(uploadedFile.fieldname);

      // Your upload service logic
      const transferData = await extractsFromAra66x(filePath);

      // Need to check if the transfer is new

      // Respond with the extracted data
      res.status(201).json({
        message: "Upload successful",
        accession: transferData?.accession,
        application: transferData?.application,
        ministry: transferData?.ministry,
        branch: transferData?.branch,
        folders: transferData?.folders,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };

  handleARIS617Upload: RequestHandler = async (req, res, next) => {
    // Your implementation here
  };
}

export default new UploadController();

// export class UploadController {
//    handleARIS66xUpload: RequestHandler = async (req, res, next) => {
//     try {
//       // Your existing validation logic
//       // For example, if you want to validate uploaded files
//       // await Promise.all(
//       //   uploadValidation.map((validation) => validation.run(req))
//       // );

//       // Example of handling validation errors
//       // const errors = validationResult(req);
//       // if (!errors.isEmpty()) {
//       //   return res.status(400).json({ errors: errors.array() });
//       // }

//       // Handle the uploaded files here (e.g., save to the database)
//       const uploadedFile = req.file;

//       if (!uploadedFile) {
//         // Handle the case where the file is not present
//         return res.status(400).json({ error: "No file uploaded" });
//       }

//       const filePath = uploadedFile.path; // Assuming the path is in 'path' property

//       console.log(uploadedFile.fieldname);

//       // Your upload service logic
//       const result = await extractsFromAra66x(filePath);

//       // Respond with the result
//       // res.status(201).json(result);

//       res.status(201).json({ message: "Upload successful" });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ error: "An error occurred" });
//     }
//   };
// }
