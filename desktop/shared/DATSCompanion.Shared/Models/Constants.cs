using System;
using System.Collections.Generic;
using System.Text;

namespace DATSCompanion.Shared.Models
{
    public class Constants
    {
        public const string HttpWebSocketListener = "http://localhost:50504";
        public const string WebSocketListener = "ws://localhost:50504";
        public const string DesktopSocketEndpoint = "/ws/desktop";
        public const string ReactSocketEndpoint = "/ws/react";
        public const string ReactReceiveSocketEndpoint = "/ws/react/receive";
        public const string EventSourceName = "CitzGrsDatsEventSource";
        public const string EventLogName = "CitzGrsDatsServiceLog";
        public const string BrowseQueryParameter = "browse";
        public const string BrowseTypeFolder = "folder";
        public const string ApplicationWindowTitle = "DATS Companion Desktop Application";
        public const string AppName = "citz-grs-dats-dc";
        public const string IpcNamedPipeName = "citz-grs-dats";
    }
}
