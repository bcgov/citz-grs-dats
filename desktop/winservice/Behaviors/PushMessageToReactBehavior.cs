using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp.Server;
using WebSocketSharp;

namespace DATSCompanionService.Behaviors
{
    public class PushMessageToReactBehavior : WebSocketBehavior
    {
        public EventLog Logger { get; set; }

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
