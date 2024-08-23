using DATSCompanion.Shared.Models;
using DATSCompanionService.Interfaces;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace DATSCompanionService.Behaviors
{
    public class ReceiveMessageFromDesktopBehavior : WebSocketBehavior
    {

        public EventLog Logger { get; set; }

        public IBroadcastService Broadcast { get; set; }
        protected override void OnMessage(MessageEventArgs e)
        {
            var messageJson = e.Data;
            var message = JsonSerializer.Deserialize<MessageContract<dynamic>>(messageJson);
            //Logger?.WriteEntry($"payload received: {messageJson}");
            switch (message.Action)
            {
                case DATSActions.FolderSelected:
                    break;
                case DATSActions.FileSelected:
                    break;
                case DATSActions.MultipleFilesSelected:
                    break;
                case DATSActions.FileInformation:
                    break;
                case DATSActions.Cancelled:
                    break;
                case DATSActions.Progress:
                    Broadcast?.NotifyClients(messageJson);
                    break;
                case DATSActions.DesktopAppClosing:
                    Broadcast?.NotifyClients(messageJson);
                    break;
                case DATSActions.Error:
                    break;
                case DATSActions.Completed:
                    break;
                case DATSActions.FolderUpload:
                    break;
                case DATSActions.CheckFolder:
                    break;
                case DATSActions.FileFolderExists:
                    Broadcast?.NotifyClients(messageJson);
                    break;
                case DATSActions.FileFolderNotExists:
                    Broadcast?.NotifyClients(messageJson);
                    break;
                case DATSActions.HealthCheck:
                    break;
                case DATSActions.Healthy:
                    break;
                case DATSActions.ErrorDesktop:
                    break;
                case DATSActions.UploadProgress:
                    Broadcast?.NotifyClients(messageJson);
                    break;
                case DATSActions.UploadSuccessfull:
                    Broadcast?.NotifyClients(messageJson);
                    break;
                case DATSActions.TechnicalMetadataJson:
                    Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                    {
                        Action = DATSActions.Completed,
                        Source = DATSSource.Service,
                        Payload = new ReportProgress
                        {
                            Progress = 0,
                            Message = "FolderSelected"
                        }
                    }));
                    var payload = JsonSerializer.Deserialize<DATSFileDetails>(message.Payload);
                    var newMessage = new MessageContract<DATSFileDetails>
                    {
                        Action = DATSActions.FileInformation,
                        Source = DATSSource.Service,
                        Payload = payload
                    };
                    Broadcast?.NotifyClients(JsonSerializer.Serialize(newMessage));
                    break;
                default:
                    Broadcast?.NotifyClients(messageJson);
                    break;
            }
        }


        private void OnFolderSelected(MessageContract<dynamic> message)
        {
            var selectedPath = message.Payload;
            var progress = new Progress<Tuple<int, string>>(p => {
                // Update progress bar
                Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<ReportProgress>
                {
                    Action = DATSActions.Progress,
                    Source = DATSSource.Service,
                    Payload = new ReportProgress
                    {
                        Progress = p.Item1,
                        Message = p.Item2
                    }
                }));
            });
            List<DATSFileInformation> fileDetailsList = TechnicalMetadataGenerator.Generate(selectedPath, progress);

            int directoryCount = Directory.EnumerateDirectories(selectedPath, "*", SearchOption.AllDirectories).Count();
            var newMessage = new MessageContract<DATSFileDetails>
            {
                Action = DATSActions.FileInformation,
                Source = DATSSource.Service,
                Payload = new DATSFileDetails
                {
                    FileCount = fileDetailsList.Count,
                    FolderCount = directoryCount,
                    Path = selectedPath,
                    SizeInBytes = fileDetailsList.Sum(f => f.SizeInBytes),
                    Files = fileDetailsList
                }
            };
            Broadcast?.NotifyClients(JsonSerializer.Serialize(new MessageContract<ReportProgress>
            {
                Action = DATSActions.Completed,
                Source = DATSSource.Service,
                Payload = new ReportProgress
                {
                    Progress = 0,
                    Message = "FolderSelected"
                }
            }));
            Broadcast?.NotifyClients(JsonSerializer.Serialize(newMessage));
        }
        protected override void OnError(WebSocketSharp.ErrorEventArgs e)
        {
            base.OnError(e);
            Logger?.WriteEntry($"Desktop app error {e.Message}");
        }

        protected override void OnOpen()
        {
            base.OnOpen();
            Logger?.WriteEntry("Desktop app connected");
        }

        protected override void OnClose(CloseEventArgs e)
        {
            base.OnClose(e);
            Logger?.WriteEntry("Desktop app DISconnected");
        }
    }
}
