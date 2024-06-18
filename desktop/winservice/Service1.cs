using DATSCompanion.Shared.Models;
using DATSCompanionService.Behaviors;
using DATSCompanionService.Interfaces;
using System.Diagnostics;
using System.ServiceProcess;
using WebSocketSharp.Server;

namespace DATSCompanionService
{
    public partial class DATSCompanionService : ServiceBase, IBroadcastService
    {
        private WebSocketServer wss;
        private EventLog eventLog;

        public DATSCompanionService()
        {
            InitializeComponent();
            eventLog = new EventLog();
            if (!EventLog.SourceExists(Constants.EventSourceName))
            {
                EventLog.CreateEventSource(Constants.EventSourceName, Constants.EventLogName);
            }
            eventLog.Source = Constants.EventSourceName;
            eventLog.Log = Constants.EventLogName;
        }

        protected override void OnStart(string[] args)
        {
            eventLog.WriteEntry("Service is starting... beta 1");
            wss = new WebSocketServer(Constants.WebSocketListener);
            
            wss.AddWebSocketService<ReceiveMessageFromDesktopBehavior>(Constants.DesktopSocketEndpoint, (b) => {
                b.Broadcast = this;
                b.Logger = eventLog;
            });
            wss.AddWebSocketService<PushMessageToReactBehavior>(Constants.ReactSocketEndpoint, (b) => {
                b.Logger = eventLog;
            });
            wss.Start();
            eventLog.WriteEntry($"Service started successfully. Socket listening on {Constants.WebSocketListener}");
        }

        protected override void OnStop()
        {
            eventLog.WriteEntry("Service is stopping...");
            wss?.Stop();
            eventLog.WriteEntry("Service stopped successfully.");
        }


        public void NotifyClients(string payload)
        {
            wss.WebSocketServices["/ws/react"].Sessions.Broadcast(payload);
        }
    }
}
