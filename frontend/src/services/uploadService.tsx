import axios from "axios";
// import ITransfer from "../Types/ITransfer"; // Adjust the path to the ITransfer interface

const API_URL = "http://localhost:5000/api/"; // Replace with your API endpoint URL

export default class UploadService {
  public async upload66xFile(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}uploadfileARIS66x`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // const transfer: ITransfer = response.data;
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }
}
