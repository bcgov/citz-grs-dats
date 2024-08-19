using DATSCompanion.Shared.Models;
using DATSCompanionService.Behaviors;
using DATSCompanionService.Interfaces;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.ServiceProcess;
using WebSocketSharp.Server;

namespace DATSCompanionService
{
    public partial class DATSCompanionService : ServiceBase, IBroadcastService
    {
        private WebSocketServer wss;
        private EventLog eventLog;
        private string _mappedDriveLetter;
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
            wss.AddWebSocketService<PushMessageReactBehavior>(Constants.ReactSocketEndpoint, (b) => {
                b.Broadcast = this;
                b.Logger = eventLog;
            });
            wss.AddWebSocketService<ReceiveMessageFromReactBehavior>(Constants.ReactReceiveSocketEndpoint, (b) => {
                b.Broadcast = this;
                b.Logger = eventLog;
            });

            wss.Start();
            eventLog.WriteEntry($"Service started successfully. Socket listening on {Constants.WebSocketListener}");
        }

        private void TestNetwrokDrive()
        {
            EventLog.WriteEntry($"Testing Network Drive");
            string networkPath = @"\\cumulus.idir.bcgov\Digital-Archives";
            string username = @"IDIR\GRSDATS";
            string password = @"pine2@MAPLE^5384";

            string availableDriveLetter = "V:";//GetFirstAvailableDriveLetter();
            _mappedDriveLetter = availableDriveLetter;
            if (!string.IsNullOrEmpty(availableDriveLetter))
            {
                // Map the network drive directly without writing to a batch file
                MapNetworkDriveFromMemory(availableDriveLetter, networkPath, username, password);
            }
            else
            {
                // Log or handle the fact that no drive letters are available
                EventLog.WriteEntry("No available drive letters.", EventLogEntryType.Warning);
            }
        }

        private string GetFirstAvailableDriveLetter()
        {
            char[] driveLetters = Enumerable.Range('Z', 1).Select(i => (char)i)
                .Concat(Enumerable.Range('Y', 'A' - 'Y' + 1).Select(i => (char)i)).ToArray();

            foreach (char driveLetter in driveLetters)
            {
                string driveName = driveLetter + ":";
                if (!DriveInfo.GetDrives().Any(d => d.Name.Equals(driveName, StringComparison.OrdinalIgnoreCase)))
                {
                    return driveName;
                }
            }

            return null;
        }

        private void MapNetworkDriveFromMemory(string driveLetter, string networkPath, string username, string password)
        {
            EventLog.WriteEntry($"MapNetworkDriveFromMemory");

            string command = $@"/C net use {driveLetter} {networkPath} /user:""{username}"" ""{password}"" /persistent:yes";
            EventLog.WriteEntry($"MapNetworkDriveFromMemory command" + command);

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "cmd.exe";
            psi.Arguments = command;
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.CreateNoWindow = true;

            using (Process process = Process.Start(psi))
            {
                process.WaitForExit();
                string output = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();

                if (process.ExitCode != 0)
                {
                    // Log or handle the error
                    EventLog.WriteEntry($"Command execution failed: {error}", EventLogEntryType.Error);
                }
                else
                {
                    EventLog.WriteEntry($"Network drive mapped to {driveLetter} successfully.");
                    var fileList = Directory.GetFiles(@"V:\TESTING-FileFormats-TechMetadata", "*.*", SearchOption.AllDirectories);
                    EventLog.WriteEntry($"filec ount: {fileList}");
                }
            }
        }

        private void UnmapNetworkDriveFromMemory(string driveLetter)
        {
            string command = $@"/C net use {driveLetter} /delete";

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "cmd.exe";
            psi.Arguments = command;
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.CreateNoWindow = true;

            using (Process process = Process.Start(psi))
            {
                process.WaitForExit();
                string output = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();

                if (process.ExitCode != 0)
                {
                    // Log or handle the error
                    EventLog.WriteEntry($"Failed to unmap drive {driveLetter}: {error}", EventLogEntryType.Error);
                }
                else
                {
                    EventLog.WriteEntry($"Network drive {driveLetter} unmapped successfully.");
                }
            }
        }

        protected override void OnStop()
        {
            eventLog.WriteEntry("Service is stopping...");
            wss?.Stop();
            if (!string.IsNullOrEmpty(_mappedDriveLetter))
            {
                UnmapNetworkDriveFromMemory(_mappedDriveLetter);
            }
            eventLog.WriteEntry("Service stopped successfully.");
        }


        public void NotifyClients(string payload)
        {
            wss.WebSocketServices["/ws/react"].Sessions.Broadcast(payload);
        }
    }
}
