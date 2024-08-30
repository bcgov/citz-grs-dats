using DATSCompanion.Shared.Models;
using DATSCompanionService.Handler;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace DATSCompanionApp.Helpers
{
    public class FileUploadHelper
    {
        public async static Task UploadLanTask(IServiceCommunicator serviceCommunicator, MessageContract<DATSFileToUpload> contract,IProgress<ReportProgress> progressManager)
        {
            DATSFileToUpload payload = contract.Payload;
            var tempPath = GetTemporaryDirectory();
            bool isUploadFail = false;
            bool isUploadSuccess = false;   
            string combinedNotes = string.Join("\n", payload.Package.Select(p => p.Note).Where(note => !string.IsNullOrEmpty(note)));
            for (int i = 0; i < payload.Package.Length; i++)
            {
                if (isUploadFail) break; //break out of loop if upload fails
                var path = payload.Package[i].Path;
                var classification = payload.Package[i].Classification;
                //Logger?.WriteEntry($"uploading folder {path}");
                isUploadSuccess = false;
                try
                {
                    var uploadFileDetails = payload;
                    if (!Directory.Exists(path))
                    {
                        await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                        {
                            Action = DATSActions.FileFolderNotExists,
                            Source = DATSSource.Service,
                            Payload = new ReportProgress
                            {
                                Progress = 100,
                                Message = path
                            }
                        }));
                        isUploadFail = true;
                        break;
                    }
                    await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                    {
                        Action = DATSActions.FileFolderExists,
                        Source = DATSSource.Service,
                        Payload = new ReportProgress
                        {
                            Progress = 100,
                            Message = path
                        }
                    }));
                    string zipFileName = $"{Path.GetFileName(path)}.zip";

                    progressManager.Report(new ReportProgress
                    {
                        Progress = 0,
                        Message = path,
                        IsIndeterminate = true,
                        ProgressMessage = "Compressing file..."
                    });
                   
                    await ZipHelper.CreateFromDirectoryWithProgressAsync(path, progressManager);
                    //Logger?.WriteEntry($"archived file for folder {zipPath}");
                    using (var stream = await ZipHelper.CreateFromDirectoryWithProgressAsync(path, progressManager))
                    {
                        var json = JsonSerializer.Serialize(TechnicalMetadataGenerator.Generate(path));
                        isUploadSuccess = await Upload(stream, path, zipFileName, payload, i == 0 ? combinedNotes : "", classification, json,false, serviceCommunicator, progressManager);
                        if (!isUploadSuccess)
                        {
                            break;
                        }
                    }
                }
                catch (Exception ex)
                {
                    isUploadFail = true;
                    // Logger?.WriteEntry($"folder upload failed {path}; reason {ex.Message} {ex.StackTrace}");

                    await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<Error>
                    {
                        Action = DATSActions.Error,
                        Source = DATSSource.Service,
                        Payload = new Error
                        {
                            Message = $"{path}"
                        }
                    }));
                }
                finally
                {

                    if (isUploadSuccess)
                    {
                        await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                        {
                            Action = DATSActions.UploadSuccessfull,
                            Source = DATSSource.Service,
                            Payload = new ReportProgress
                            {
                                Progress = 100,
                                Message = path
                            }
                        }));
                    }
                }
            }
        }

        internal static async Task UploadEdrmsTask(IServiceCommunicator serviceCommunicator, MessageContract<DATSFileToUpload> contract, IProgress<ReportProgress> progressManager)
        {
            var payload = contract.Payload;
            var package = contract.Payload.Package.First();
            var targetFolder = package.Path;
            var tsvFilePath = Path.Combine(targetFolder, contract.Payload.Filename);
            progressManager.Report(new ReportProgress
            {
                Progress = 0,
                Message = targetFolder,
                IsIndeterminate = true,
                ProgressMessage = "Reading file..."
            });
            var tsvLines = File.ReadAllLines(tsvFilePath);
            if (tsvLines.Length == 0)
            {
                await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<Error>
                {
                    Action = DATSActions.Error,
                    Source = DATSSource.Desktop,
                    Payload = new Error
                    {
                        Message = targetFolder
                    }
                }));
                throw new Exception("Dataport file empty");
            }

            var headers = tsvLines[0].Split('\t');
            int containerIndex = Array.IndexOf(headers, "Container (Folder/Box)");
            int fileIndex = Array.IndexOf(headers, "DOS file");

            if (containerIndex == -1 || fileIndex == -1)
            {
                await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<Error>
                {
                    Action = DATSActions.Error,
                    Source = DATSSource.Desktop,
                    Payload = new Error
                    {
                        Message = targetFolder
                    }
                }));
                throw new Exception("Dataport file corrupted");
            }
            await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
            {
                Action = DATSActions.FileFolderExists,
                Source = DATSSource.Service,
                Payload = new ReportProgress
                {
                    Progress = 100,
                    Message = targetFolder
                }
            }));
            progressManager.Report(new ReportProgress
            {
                Progress = 0,
                Message = targetFolder,
                IsIndeterminate = true,
                ProgressMessage = "Grouping files ..."
            });
            var fileContainerMap = new Dictionary<string, (string psVal, string secId)>();

            //(skip headers)
            for (int i = 1; i < tsvLines.Length; i++)
            {
                var columns = tsvLines[i].Split('\t');
                if (columns.Length <= Math.Max(containerIndex, fileIndex)) continue; // Ensure there are enough columns

                var container = columns[containerIndex];
                var filePath = columns[fileIndex];
                if(string.IsNullOrEmpty(container) || string.IsNullOrEmpty(filePath)) continue;
                //classifaction = primaryseconday
                var classification = container.Substring(container.IndexOf('-') + 1, container.IndexOf('/') - container.IndexOf('-') - 1);
                var folderContainer = container.Substring(container.IndexOf('/') + 1);

                fileContainerMap[filePath] = (classification, folderContainer);
            }

            // Step 4: Check for file existence in the target folder
            var filesInFolder = Directory.GetFiles(targetFolder, "*", SearchOption.AllDirectories);
            var filesInFolderSet = new HashSet<string>(filesInFolder);

            var groupedFiles = new Dictionary<string, (List<string> files, string psVal)>();
            var deletedFiles = new List<string>();

            foreach (var kvp in fileContainerMap)
            {
                var folderContainer = kvp.Value.secId;
                var psVal = kvp.Value.psVal;
                if (ContainsInEdrmFolder(targetFolder,kvp.Key, out string filePath))
                {
                    if (!groupedFiles.ContainsKey(folderContainer))
                    {
                        groupedFiles[folderContainer] = (new List<string>(), psVal);
                    }
                     groupedFiles[folderContainer].files.Add(filePath);
                    filesInFolderSet.Remove(kvp.Key); // Remove from set as it's already processed
                }
                else
                {
                    deletedFiles.Add(filePath); // File in TSV but not in folder
                }
            }

            // Files in folder but not in TSV
            groupedFiles.Add("other", (filesInFolderSet.ToList(), "other"));
            progressManager.Report(new ReportProgress
            {
                Progress = 0,
                Message = targetFolder,
                IsIndeterminate = true,
                ProgressMessage = "Compressing..."
            });
            foreach (var group in groupedFiles)
            {
                string folderContainer = group.Key;
                List<string> files = group.Value.files;

                using (var memoryStream = new MemoryStream())
                {
                    using (var zip = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                    {
                        foreach (var file in files)
                        {
                            zip.CreateEntryFromFile(file, Path.GetFileName(file), CompressionLevel.NoCompression);
                        }
                    }

                    memoryStream.Seek(0, SeekOrigin.Begin); // Reset stream position
                    var json =JsonSerializer.Serialize(TechnicalMetadataGenerator.Generate(files.ToArray()));
                    await Upload(memoryStream, targetFolder, $"{folderContainer}.zip", payload, "", group.Value.psVal,json, true, serviceCommunicator, progressManager);
                }
            }
            await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
            {
                Action = DATSActions.UploadSuccessfull,
                Source = DATSSource.Service,
                Payload = new ReportProgress
                {
                    Progress = 100,
                    Message = targetFolder
                }
            }));
        }

        private static bool ContainsInEdrmFolder(string dir, string filePath, out string actualFilename)
        {
            string fileName = Path.GetFileName(filePath);
            var file = Path.Combine(dir, fileName);
            if (File.Exists(file))
            {
                actualFilename = file;
                return true;
            }
            //try 1
            int underscoreIndex = fileName.IndexOf('_');
            if (underscoreIndex != -1)
            {
                fileName = fileName.Substring(underscoreIndex + 1); // Remove up to and including the underscore
                file = Path.Combine(dir, fileName);
                if (File.Exists(file))
                {
                    actualFilename = file;
                    return true;
                }
                //try 1.1
                // Find the index of the first space
                int firstSpaceIndex = fileName.IndexOf(' ');

                // Check if a space was found
                if (firstSpaceIndex != -1)
                {

                    // Replace the first space with two spaces
                    fileName = fileName.Substring(0, firstSpaceIndex)  + fileName.Substring(firstSpaceIndex + 1);
                    file = Path.Combine(dir, fileName);
                    if (File.Exists(file))
                    {
                        actualFilename = file;
                        return true;
                    }
                }
            }
            actualFilename = "";
            return false;
            
        }
        private async static Task<bool> Upload(Stream stream,string path, string filename, DATSFileToUpload payload,string combinedNotes, string classification, string technicalMetadata,bool isEdrms, IServiceCommunicator serviceCommunicator, IProgress<ReportProgress> progressManager)
        {
            // Calculate SHA-1 checksum
            string checksum = CalculateSHA1(stream);
            // Upload the zip file and checksum
            stream.Seek(0, SeekOrigin.Begin); // Reset stream position

            using (var client = new HttpClient())
            {
                var content = new MultipartFormDataContent();
                var totalBytes = stream.Length;
                var startTime = DateTime.UtcNow;

                var fileContent = new ProgressableStreamContent(stream, (sentBytes) =>
                {
                    var progress = (double)sentBytes / totalBytes * 100;
                    var bytesRemaining = totalBytes - sentBytes;
                    var eta = sentBytes > 0
                        ? TimeSpan.FromSeconds(bytesRemaining / (sentBytes / (DateTime.UtcNow - startTime).TotalSeconds))
                        : TimeSpan.Zero;
                    progressManager?.Report(new ReportProgress
                    {
                        Progress = progress,
                        Message = path,
                        TotalBytes = (sentBytes + bytesRemaining),
                        BytesUploaded = sentBytes,
                        BytesRemaining = bytesRemaining,
                        ETA = eta.ToString(@"hh\:mm\:ss")
                    });
                });

                fileContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("application/octet-stream");
                fileContent.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data")
                {
                    Name = "file",
                    FileName = filename
                };

                // Add the file content to the multipart content
                content.Add(fileContent);

                // Add additional fields to the multipart content
                content.Add(new StringContent(checksum), "checksum");
                content.Add(new StringContent(payload.TransferId), "transferId");
                content.Add(new StringContent(payload.ApplicationNumber), "applicationNumber");
                content.Add(new StringContent(payload.AccessionNumber), "accessNumber");
                content.Add(new StringContent(classification), "classification");
                content.Add(new StringContent(technicalMetadata), "technicalV2");
                if (!string.IsNullOrEmpty(combinedNotes))
                {
                    content.Add(new StringContent(combinedNotes), "note");
                }

                // Post the content to the server
                var result = await client.PostAsync(payload.UploadUrl, content);
                if (result.IsSuccessStatusCode)
                {
                    return true;
                }
                else
                {
                    //  Logger?.WriteEntry($"folder upload failed {path}; reason {result.StatusCode}");

                    await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<Error>
                    {
                        Action = DATSActions.Error,
                        Source = DATSSource.Service,
                        Payload = new Error
                        {
                            Message = $"{path}"
                        }
                    }));
                    return false;
                }
            }
        }
        private static string CalculateSHA1(Stream stream)
        {
            using (var sha1 = SHA1.Create())
            {
                var hash = sha1.ComputeHash(stream);
                return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
            }
        }

        private static string GetTemporaryDirectory()
        {
            string tempDirectory = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());

            if (File.Exists(tempDirectory))
            {
                return GetTemporaryDirectory();
            }
            else
            {
                Directory.CreateDirectory(tempDirectory);
                return tempDirectory;
            }
        }
    }
}
