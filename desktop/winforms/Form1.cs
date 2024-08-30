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
           //MessageBox.Show("Debug");
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
            //await ProcessCommandLineArgs(@"citz-grs-dats://upload?payload=eyJBY3Rpb24iOjgsIlBheWxvYWQiOnsiUGFja2FnZSI6W3siUGF0aCI6IkM6XFxVc2Vyc1xcTlNZRURcXERvd25sb2Fkc1xcRURSTVMgX1NhbXBsZV9EYXRhIiwiQ2xhc3NpZmljYXRpb24iOiJxIn1dLCJGaWxlbmFtZSI6IkRpZ2l0YWwgQXJjaGl2ZXMgZXhhbXBsZSAyMDI0LTA2LTEwIDIudHh0IiwiSXNFZHJtcyI6dHJ1ZSwiVHJhbnNmZXJJZCI6IjY2Y2YwNTc1YTFlZmJmYTgzMzk5ZGU2ZSIsIkFwcGxpY2F0aW9uTnVtYmVyIjoiMDAwMDQ5IiwiQWNjZXNzaW9uTnVtYmVyIjoiMDAwMDQ5LTA0OSIsIlVwbG9hZFVybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9hcGkvdXBsb2FkLWZpbGVzIn19");

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
            if (message.Payload.IsIndeterminate)
            {
                toolStripProgressBar1.Style = ProgressBarStyle.Marquee;
            }
            else
            {
                toolStripProgressBar1.Style = ProgressBarStyle.Continuous;
                toolStripProgressBar1.Value = Convert.ToInt32(message.Payload.Progress);
            }
            if (string.IsNullOrEmpty(message.Payload.ProgressMessage))
            {
                toolStripStatusLabel1.Text = message.Payload.Message;
            }
            else
            {
                toolStripStatusLabel1.Text = message.Payload.ProgressMessage;
            }
            await  this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(message));
        }

        public static string Decompress(string compressedData)
        {
            byte[] data = Convert.FromBase64String(compressedData);

            return Encoding.UTF8.GetString(data);
        }

        private async Task UploadFolderV2(string message, IProgress<ReportProgress> progressManager)
        {
            var contract = JsonSerializer.Deserialize<MessageContract<DATSFileToUpload>>(message);


            try
            {
                if (contract.Payload.IsEdrms)
                {
                    await FileUploadHelper.UploadEdrmsTask(serviceCommunicator, contract, progressManager);
                }
                else
                {
                    await FileUploadHelper.UploadLanTask(serviceCommunicator, contract, progressManager);
                }
            }
            catch (Exception)
            {

                await serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<Error>
                {
                    Action = DATSActions.Error,
                    Source = DATSSource.Service,
                    Payload = new Error
                    {
                        Message = "Error!"
                    }
                }));
            }
        }


        
    }
}
