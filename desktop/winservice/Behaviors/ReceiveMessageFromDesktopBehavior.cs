using DATSCompanion.Shared.Models;
using DATSCompanionService.Interfaces;
using System.Diagnostics;
using System.IO;
using System.Linq;
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
            var message = System.Text.Json.JsonSerializer.Deserialize<MessageContract<string>>(messageJson);
            Logger?.WriteEntry($"payload received: {messageJson}");

            if (message.Action == DATSActions.FolderSelected)
            {
                var selectedPath = message.Payload;
                int directoryCount = Directory.EnumerateDirectories(selectedPath, "*", SearchOption.AllDirectories).Count();
                int fileCount = Directory.EnumerateFiles(selectedPath, "*", SearchOption.AllDirectories).Count();
                long size = Directory.EnumerateFiles(selectedPath, "*", SearchOption.AllDirectories).Sum(file => new FileInfo(file).Length);
                var newMessage = new MessageContract<DATSFileInformation>
                {
                    Action = DATSActions.FolderSelected,
                    Source = DATSSource.Service,
                    Payload = new DATSFileInformation
                    {
                        FileCount = fileCount,
                        FolderCount = directoryCount,
                        Path = selectedPath,
                        SizeInBytes = size
                    }
                };
                Broadcast?.NotifyClients(System.Text.Json.JsonSerializer.Serialize(newMessage));
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
