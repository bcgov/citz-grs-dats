import axios from "axios";
import { Aris66UploadResponse } from "../types/DTO/Interfaces/Aris66UploadResponse"
const API_URL = "http://localhost:5000/api/"; // Replace with your API endpoint URL

export default class UploadService {
  public async upload66xFile(formData: any): Promise<Aris66UploadResponse> {
    return await axios
      .post(`${API_URL}uploadfileARIS66x`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const jsonResponse = {"message":"Upload ARIS 66x successful","transfer":{"accessionNumber":"99-1234","applicationNumber":"111299","transferStatus":"Draft","digitalFileLists":[{"primarySecondary":"29900-05","schedule":"164437","description":"164437 - BARRISTER AND SOLICITOR SERVICES : LEGAL SUPPORT SERVICES - Ethnohistorical research reports - final : Songhees reconciliation 72653 - 2000-2009 - Jill Clark","fileId":"72653","folder":"C:\\Doc","transfer":"6660e3f88f987c7b834570ab","digitalFiles":[{"checksum_SHA_256":"73b3600c2f552f73882c3e436f065fb2cd99877e15a6737dd7828153cdb7e07d","filePath":"C:\\Doc\\ars653-fakedata-20230418.pdf","fileName":"ars653-fakedata-20230418.pdf","objectCreateDate":"2023-10-17T08:52:00.000Z","lastModifiedDate":"2023-10-16T14:03:00.000Z","lastAccessDate":"2024-05-30T13:42:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Adobe Acrobat Document","programType":"","size":"1.40 MB","version":"","digitalFileList":"6660e3f88f987c7b834570ad","digitalObject":[""],"_id":"6660e3f88f987c7b834570b5","__v":0},{"checksum_SHA_256":"ed31225e60eef4d07745b9fbf9a4a11910ef9c17ac4e546464475cda8fac2b0b","filePath":"C:\\Doc\\ars661-jl-11-22222-2 folders.xlsx","fileName":"ars661-jl-11-22222-2 folders.xlsx","objectCreateDate":"2024-05-29T10:15:00.000Z","lastModifiedDate":"2024-05-28T17:07:00.000Z","lastAccessDate":"2024-05-30T13:21:00.000Z","authors":"Roland, Hannah MTIC:EX","owners":"GROUPINFRA\\jacques.levesque","company":"Province of British Columbia","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Excel Worksheet","programType":"Microsoft Excel","size":"21.3 KB","version":"","digitalFileList":"6660e3f88f987c7b834570ad","digitalObject":[""],"_id":"6660e3f88f987c7b834570b9","__v":0},{"checksum_SHA_256":"e1483d7aac2826f1f1d810d771d83e9013523f454dbdbc24887db12f5db2d986","filePath":"C:\\Doc\\ars661-jl-99-88888-5 folders.xlsx","fileName":"ars661-jl-99-88888-5 folders.xlsx","objectCreateDate":"2024-05-29T10:15:00.000Z","lastModifiedDate":"2024-05-29T10:14:00.000Z","lastAccessDate":"2024-05-30T13:42:00.000Z","authors":"Roland, Hannah MTIC:EX","owners":"GROUPINFRA\\jacques.levesque","company":"Province of British Columbia","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Excel Worksheet","programType":"Microsoft Excel","size":"21.6 KB","version":"","digitalFileList":"6660e3f88f987c7b834570ad","digitalObject":[""],"_id":"6660e3f88f987c7b834570bd","__v":0},{"checksum_SHA_256":"daaa977d61b90800853314c625e54ca8a6a6ec2fb6b4208ff88e724042e87e21","filePath":"C:\\Doc\\cloud_security_schedule.pdf","fileName":"cloud_security_schedule.pdf","objectCreateDate":"2023-10-17T08:52:00.000Z","lastModifiedDate":"2022-10-27T13:27:00.000Z","lastAccessDate":"2024-05-30T13:42:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Adobe Acrobat Document","programType":"","size":"104 KB","version":"","digitalFileList":"6660e3f88f987c7b834570ad","digitalObject":[""],"_id":"6660e3f88f987c7b834570c1","__v":0},{"checksum_SHA_256":"c50da9c067513aa2fc7e101654575b2b796bd24863fc34d437505fb61d7bc75d","filePath":"C:\\Doc\\Digital Transfer Process Project Brief - Jan 10.docx","fileName":"Digital Transfer Process Project Brief - Jan 10.docx","objectCreateDate":"2024-05-23T10:27:00.000Z","lastModifiedDate":"2023-02-01T15:09:00.000Z","lastAccessDate":"2024-05-30T13:42:00.000Z","authors":"Khan, Alexandra CITZ:EX","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Word Document","programType":"Microsoft Office Word","size":"43.4 KB","version":"","digitalFileList":"6660e3f88f987c7b834570ad","digitalObject":[""],"_id":"6660e3f88f987c7b834570c5","__v":0},{"checksum_SHA_256":"bb31316228f5593f57fb00c09b080f3f461c1afee2e3e10dafbe437f719ff48e","filePath":"C:\\Doc\\LilyPics - uuid-346ea65c-e8b5-4a8b-ad9e-b0189de13427.zip","fileName":"LilyPics - uuid-346ea65c-e8b5-4a8b-ad9e-b0189de13427.zip","objectCreateDate":"2024-05-27T08:37:00.000Z","lastModifiedDate":"2023-02-08T14:41:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Compressed (zipped) Folder","programType":"","size":"2.17 MB","version":"","digitalFileList":"6660e3f88f987c7b834570ad","digitalObject":[""],"_id":"6660e3f88f987c7b834570c9","__v":0}],"isOPR":true,"startDate":"2000-01-23T00:00:00.000Z","endtDate":"2009-12-23T00:00:00.000Z","finalDispositionDate":"2009-12-31T00:00:00.000Z","_id":"6660e3f88f987c7b834570ad","createDate":"2024-06-05T22:17:28.430Z","updatedDate":"2024-06-05T22:17:28.430Z","__v":0},{"primarySecondary":"","schedule":"","description":"","fileId":"","folder":"C:\\Doc2","transfer":"6660e3f88f987c7b834570ab","digitalFiles":[{"checksum_SHA_256":"1210a668ea2104484af560143181092f56c6c70a03900b02481f2c652a660f87","filePath":"C:\\Doc2\\2023-01-10-092148.csv","fileName":"2023-01-10-092148.csv","objectCreateDate":"2024-05-27T08:56:00.000Z","lastModifiedDate":"2023-01-10T09:21:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Excel Comma Separated Values File","programType":"","size":"997 bytes","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f88f987c7b834570cd","__v":0},{"checksum_SHA_256":"b3d4514f6c372d34dc72f1d2df64e0831d389a54196d9e33c694b4680d495c7d","filePath":"C:\\Doc2\\ARCS-00201-4087424A\\Automatic reply Test for digital archives - reports.msg","fileName":"Automatic reply Test for digital archives - reports.msg","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-26T10:43:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Outlook Item","programType":"","size":"38.5 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f88f987c7b834570d1","__v":0},{"checksum_SHA_256":"2624e6b99906fe84e28c0680c3525a63d2222e62a594c65819010174fbd4190d","filePath":"C:\\Doc2\\ARCS-00201-4087424A\\CT11447556_Test for Digital Archives.DOCX","fileName":"CT11447556_Test for Digital Archives.DOCX","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-23T09:13:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"Thompson, Joanna CITZ:EX","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Word Document","programType":"Microsoft Office Word","size":"12.9 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f88f987c7b834570d5","__v":0},{"checksum_SHA_256":"822a22def083e6a9d7eea7db88cd414f37492ea2067a92fff1762665493daa7e","filePath":"C:\\Doc2\\ARCS-00975-056024A\\CT11447557_Test for Digital Archives.XLSX","fileName":"CT11447557_Test for Digital Archives.XLSX","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-23T09:12:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"Thompson, Joanna CITZ:EX","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Excel Worksheet","programType":"Microsoft Excel","size":"8.66 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f88f987c7b834570d9","__v":0},{"checksum_SHA_256":"2624e6b99906fe84e28c0680c3525a63d2222e62a594c65819010174fbd4190d","filePath":"C:\\Doc2\\ARCS-00975-056024A\\CT11447559_Test for Digital Archives 2.DOCX","fileName":"CT11447559_Test for Digital Archives 2.DOCX","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-23T09:13:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"Thompson, Joanna CITZ:EX","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Word Document","programType":"Microsoft Office Word","size":"12.9 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f88f987c7b834570dd","__v":0},{"checksum_SHA_256":"822a22def083e6a9d7eea7db88cd414f37492ea2067a92fff1762665493daa7e","filePath":"C:\\Doc2\\ARCS-00975-056024A\\CT11447560_Test for Digital Archives 2.XLSX","fileName":"CT11447560_Test for Digital Archives 2.XLSX","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-23T09:44:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"Thompson, Joanna CITZ:EX","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Microsoft Excel Worksheet","programType":"Microsoft Excel","size":"8.66 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f88f987c7b834570e1","__v":0},{"checksum_SHA_256":"7c057e7fd061eb92f71fae57e28ac4b0883099b01c8ea95b2a1a5647904a727a","filePath":"C:\\Doc2\\ARCS-00975-056024A\\Test for digital archives - reports.msg","fileName":"Test for digital archives - reports.msg","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-26T10:44:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Outlook Item","programType":"","size":"41.5 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f98f987c7b834570e5","__v":0},{"checksum_SHA_256":"cc0061920cf7ceb18927c734f7d660cd256ef4a3d167903b741d3617fb28b318","filePath":"C:\\Doc2\\ARCS-00975-056024A\\Test for Digital Archives.msg","fileName":"Test for Digital Archives.msg","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-26T10:43:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Outlook Item","programType":"","size":"40.0 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f98f987c7b834570e9","__v":0},{"checksum_SHA_256":"4dd4476afd0eaf2d643c0ae6bfcf87be95c3477b5375b2ce48abb586cfc19994","filePath":"C:\\Doc2\\ARCS-00975-056024A\\With attachment.msg","fileName":"With attachment.msg","objectCreateDate":"2024-05-27T08:09:00.000Z","lastModifiedDate":"2024-01-26T10:44:00.000Z","lastAccessDate":"2024-05-30T13:43:00.000Z","authors":"","owners":"GROUPINFRA\\jacques.levesque","company":"","computer":"CA-L19NW8G3 (this PC)","contenType":"Outlook Item","programType":"","size":"63.0 KB","version":"","digitalFileList":"6660e3f88f987c7b834570b1","digitalObject":[""],"_id":"6660e3f98f987c7b834570ed","__v":0}],"isOPR":false,"startDate":null,"endtDate":null,"finalDispositionDate":null,"_id":"6660e3f88f987c7b834570b1","createDate":"2024-06-05T22:17:28.471Z","updatedDate":"2024-06-05T22:17:28.471Z","__v":0}],"producerMinistry":"Attorney General","producerBranch":"Record Management","_id":"6660e3f88f987c7b834570ab","createDate":"2024-06-05T22:17:28.351Z","updatedDate":"2024-06-05T22:17:28.351Z","__v":0}};
        
        const jsonString = JSON.stringify(jsonResponse);
        const resTest: Aris66UploadResponse = JSON.parse(jsonString);
        return resTest;
        //return response.data;
      });
  }

  public async get66xFileTransferInfos(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}get66xFileTransferInfos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async upload617File(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}uploadfileARIS617`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }
  public async checkFolderAccessibility(folderPath: string): Promise<boolean> {
    try {
      // Make an API call or any other method to check folder accessibility
      const response = await axios.get(
        `/api/check-accessibility?folder=${folderPath}`
      );

      // Assuming the API responds with a boolean indicating accessibility
      return response.data.accessible;
    } catch (error) {
      console.error("Error checking folder accessibility:", error);
      return false; // Handle error as needed
    }
  }
}
