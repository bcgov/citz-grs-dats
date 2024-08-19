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
            var message = JsonSerializer.Deserialize<MessageContract<string>>(messageJson);
            Logger?.WriteEntry($"payload received: {messageJson}");

            if (message.Action == DATSActions.FolderSelected)
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
            Broadcast?.NotifyClients(messageJson);
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
