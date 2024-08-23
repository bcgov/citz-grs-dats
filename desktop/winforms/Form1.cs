using DATSCompanion.Shared;
using DATSCompanion.Shared.Models;
using DATSCompanionApp.Helpers;
using DATSCompanionService.Handler;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Security.Policy;
using System.Text;
using System.Text.Json;
using System.Web;
using System.Windows.Forms;

namespace DATSCompanionApp
{
    public partial class MainForm : Form
    {
        private readonly IServiceCommunicator serviceCommunicator;
        private readonly string[] Args;
        public MainForm(string[] args)
        {
            InitializeComponent();
            this.Text = Constants.ApplicationWindowTitle;
            this.serviceCommunicator = new WebSocketServiceCommunicator();
            this.Args = args;
            this.Load += MainForm_Load;
            this.FormClosing += MainForm_FormClosing;
          // MessageBox.Show("Debug");
           //ProcessCommandLineArgs(@"citz-grs-dats://upload?payload=eyJBY3Rpb24iOjgsIlBheWxvYWQiOnsiUGFja2FnZSI6W3siUGF0aCI6IkM6XFxVc2Vyc1xcTlNZRURcXERvY3VtZW50c1xcREFUU1xcZm9sZGVyMSIsIkNsYXNzaWZpY2F0aW9uIjoiMTIzIn0seyJQYXRoIjoiQzpcXFVzZXJzXFxOU1lFRFxcRG9jdW1lbnRzXFxEQVRTXFxmb2xkZXIyIiwiQ2xhc3NpZmljYXRpb24iOiIxMjMifV0sIlRyYW5zZmVySWQiOiI2NmM1MGE3MGEzODM3NWE3OWE5ZjNiZjgiLCJBcHBsaWNhdGlvbk51bWJlciI6IjM0NTEyNiIsIkFjY2Vzc2lvbk51bWJlciI6IjEyMzk4NyIsIlVwbG9hZFVybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9hcGkvdXBsb2FkLWZpbGVzIn19");
        }

        private void MainForm_FormClosing(object? sender, FormClosingEventArgs e)
        {
            this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<string>
            {
                Action = DATSActions.DesktopAppClosing,
                Source = DATSSource.Desktop,
            }));
        }

        private async void MainForm_Load(object? sender, EventArgs e)
        {
            if (Args.Length > 0)
            {
                string protocolArgument = Args[0];
                await ProcessCommandLineArgs(protocolArgument);
            }
        }

        public async Task ProcessCommandLineArgs(string args)
        {
            try
            {
                NameValueCollection queryParameters = ParseQueryString(args);
                if (queryParameters[Constants.BrowseQueryParameter] != null)
                {
                    await OpenDialog(queryParameters[Constants.BrowseQueryParameter]);
                }
                else if (queryParameters["payload"] != null)
                {
                   await Upload(queryParameters["payload"]);
                }
            }
            finally
            {
                Close();
            }
        }

        private async Task Upload(string? compressed)
        {
            var payload = Decompress(compressed);
            var progress = new Progress<ReportProgress>(async p => {
               await NoitfyUpdate(new MessageContract<ReportProgress>
                {
                    Action = DATSActions.UploadProgress,
                    Source = DATSSource.Desktop,
                    Payload = p
                });
            });
            await Task.Run(async () =>
            {
                await UploadFolderV2(payload, progress);
            });
        }

        private NameValueCollection ParseQueryString(string url)
        {
            Uri uri = new Uri(url);
            return HttpUtility.ParseQueryString(uri.Query);
        }

        private async Task OpenDialog(string browseType)
        {
            switch (browseType)
            {
                case Constants.BrowseTypeFolder:
                    using (var folderDialog = new FolderBrowserDialog())
                    {
                        if (folderDialog.ShowDialog() == DialogResult.OK)
                        {
                            var selectedPath = folderDialog.SelectedPath;
                            //generate technical specs
                            var progress = new Progress<Tuple<int, string>>(async p => {
                                await NoitfyUpdate(new MessageContract<ReportProgress>
                                {
                                    Action = DATSActions.Progress,
                                    Source = DATSSource.Desktop,
                                    Payload = new ReportProgress
                                    {
                                        Progress = p.Item1,
                                        Message = p.Item2
                                    }
                                });
                            });
                            await Task.Run(() => {
                                var list = TechnicalMetadataGenerator.Generate(selectedPath, progress);
                                int directoryCount = Directory.EnumerateDirectories(selectedPath, "*", SearchOption.AllDirectories).Count();
                                this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<DATSFileDetails>
                                {
                                    Action = DATSActions.TechnicalMetadataJson,
                                    Source = DATSSource.Desktop,
                                    Payload = new DATSFileDetails
                                    {
                                        FileCount = list.Count,
                                        Files = list,
                                        FolderCount = directoryCount,
                                        Path = selectedPath,
                                        SizeInBytes = list.Sum(f => f.SizeInBytes),
                                    }
                                }));
                            });
                            //reset the progress and message
                            ResetProgress();
                            Close();

                        }
                        else
                        {
                            Close();
                        }
                    }
                    break;
                default:
                    await this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<string>
                    {
                        Action = DATSActions.Error,
                        Source = DATSSource.Desktop,
                        Payload = $"Unknown browse type: {browseType}"
                    }));
                    break;
            }
        }

        private void ResetProgress()
        {
            toolStripProgressBar1.Value = 0;
            toolStripStatusLabel1.Text = string.Empty;
        }

        private async Task NoitfyUpdate(MessageContract<ReportProgress> message)
        {
            toolStripProgressBar1.Value =Convert.ToInt32( message.Payload.Progress);
            toolStripStatusLabel1.Text = message.Payload.Message;
            await  this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(message));
        }

        public static string Decompress(string compressedData)
        {
            byte[] data = Convert.FromBase64String(compressedData);

            return Encoding.UTF8.GetString(data);

            //byte[] compressedBytes = Convert.FromBase64String(compressedData);

            //using (var inputStream = new MemoryStream(compressedBytes))
            //using (var gzipStream = new GZipStream(inputStream, CompressionMode.Decompress))
            //using (var outputStream = new MemoryStream())
            //{
            //    gzipStream.CopyTo(outputStream);
            //    return Encoding.UTF8.GetString(outputStream.ToArray());
            //}
        }

        private async Task UploadFolderV2(string message, IProgress<ReportProgress> progressManager)
        {
            var contract = JsonSerializer.Deserialize<MessageContract<DATSFileToUpload>>(message);
            var tempPath = GetTemporaryDirectory();
            DATSFileToUpload payload = contract.Payload;
            string combinedNotes = string.Join("\n", payload.Package.Select(p => p.Note).Where(note => !string.IsNullOrEmpty(note)));
            bool isUploadFail = false;
            string zipPath = null;
            for (int i = 0; i < payload.Package.Length; i++)
            {
                if (isUploadFail) break; //break out of loop if upload fails
                var path = payload.Package[i].Path;
                var classification = payload.Package[i].Classification;
                //Logger?.WriteEntry($"uploading folder {path}");

                try
                {
                    var uploadFileDetails = payload;
                    if (!Directory.Exists(path))
                    {
                        await this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
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
                    await this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
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
                    zipPath = Path.Combine(tempPath, zipFileName);
                    await this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                    {
                        Action = DATSActions.UploadProgress,
                        Source = DATSSource.Service,
                        Payload = new ReportProgress
                        {
                            Progress = 0,
                            Message = path,
                            IsIndeterminate = true
                        }
                    }));
                    // Zip the folder
                    if (File.Exists(zipPath))
                    {
                        File.Delete(zipPath);
                    }
                    //ZipFile.CreateFromDirectory(path, zipPath);
                    await ZipHelper.CreateFromDirectoryWithProgressAsync(path, zipPath, progressManager);
                    //Logger?.WriteEntry($"archived file for folder {zipPath}");

                    // Calculate SHA-1 checksum
                    string checksum = CalculateSHA1(zipPath);

                    // Upload the zip file and checksum
                    using (var client = new HttpClient())
                    {
                        var content = new MultipartFormDataContent();
                        var fileStream = new FileStream(zipPath, FileMode.Open, FileAccess.Read);
                        var totalBytes = fileStream.Length;
                        var startTime = DateTime.UtcNow;

                        var fileContent = new ProgressableStreamContent(fileStream, (sentBytes) =>
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
                            FileName = Path.GetFileName(zipPath)
                        };

                        // Add the file content to the multipart content
                        content.Add(fileContent);

                        // Add additional fields to the multipart content
                        content.Add(new StringContent(checksum), "checksum");
                        content.Add(new StringContent(payload.TransferId), "transferId");
                        content.Add(new StringContent(payload.ApplicationNumber), "applicationNumber");
                        content.Add(new StringContent(payload.AccessionNumber), "accessNumber");
                        content.Add(new StringContent(classification), "classification");
                        content.Add(new StringContent(JsonSerializer.Serialize(TechnicalMetadataGenerator.Generate(path))), "technicalV2");
                        if (i == 0 && !string.IsNullOrEmpty(combinedNotes))
                        {
                            content.Add(new StringContent(combinedNotes), "note");
                        }

                        // Post the content to the server
                        var result = await client.PostAsync(payload.UploadUrl, content);
                        if (result.IsSuccessStatusCode)
                        {
                            await this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
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
                        else
                        {
                            //  Logger?.WriteEntry($"folder upload failed {path}; reason {result.StatusCode}");

                            await  this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<Error>
                            {
                                Action = DATSActions.Error,
                                Source = DATSSource.Service,
                                Payload = new Error
                                {
                                    Message = $"{path}"
                                }
                            }));
                            break; //stop all transfers even if one fails!!
                        }
                    }
                }
                catch (Exception ex)
                {
                    isUploadFail = true;
                    // Logger?.WriteEntry($"folder upload failed {path}; reason {ex.Message} {ex.StackTrace}");

                    await this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<Error>
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
                    //deleting a file is throwing error
                    //TODO. revisit this
                    //if (!string.IsNullOrEmpty(zipPath) && File.Exists(zipPath))
                    //{
                    //    await Task.Delay(10); // Small delay
                    //    File.Delete(zipPath);
                    //}
                }
            }

            //if (!isUploadFail)
            //{
            //    // Logger?.WriteEntry($"all uploads succesful for {payload.TransferId} : {payload.ApplicationNumber} : {payload.AccessionNumber} ");

            //    //all uploads succesful
            //    await this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<ReportProgress>
            //    {
            //        Action = DATSActions.UploadSuccessfull,
            //        Source = DATSSource.Service,
            //        Payload = new ReportProgress
            //        {
            //            Progress = 100,
            //            Message = path
            //        }
            //    }));
            //}
        }


        private string CalculateSHA1(string filePath)
        {
            using (var sha1 = SHA1.Create())
            {
                using (var stream = File.OpenRead(filePath))
                {
                    var hash = sha1.ComputeHash(stream);
                    return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
                }
            }
        }

        private string GetTemporaryDirectory()
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
