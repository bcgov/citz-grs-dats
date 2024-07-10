using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp.Server;
using WebSocketSharp;
using DATSCompanion.Shared.Models;
using System.IO.Compression;
using System.IO;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text.Json;
using DATSCompanionService.Interfaces;

namespace DATSCompanionService.Behaviors
{
    public class PushMessageReactBehavior : WebSocketBehavior
    {
        public EventLog Logger { get; set; }
        public IBroadcastService Broadcast { get; set; }
        protected override void OnOpen()
        {
            base.OnOpen();
            Logger?.WriteEntry("React app connected");
        }

        protected override void OnClose(CloseEventArgs e)
        {
            base.OnClose(e);
            Logger?.WriteEntry("React app DISconnected");
        }

        protected override void OnError(WebSocketSharp.ErrorEventArgs e)
        {
            base.OnError(e);
            Logger?.WriteEntry($"React app error {e.Message}");
        }
    }
}
