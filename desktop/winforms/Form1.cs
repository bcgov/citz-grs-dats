using DATSCompanion.Shared.Models;
using System.Collections.Specialized;
using System.IO;
using System.Security.Policy;
using System.Text.Json;
using System.Web;
using System.Windows.Forms;

namespace DATSCompanionApp
{
    public partial class MainForm : Form
    {
        private readonly IServiceCommunicator serviceCommunicator;
        public MainForm(string[] args)
        {
            InitializeComponent();
            this.Text = Constants.ApplicationWindowTitle;
            this.serviceCommunicator = new WebSocketServiceCommunicator();
            if (args.Length > 0)
            {
                string protocolArgument = args[0];
                ProcessCommandLineArgs(protocolArgument);
            }
        }

        public void ProcessCommandLineArgs(string args)
        {
            NameValueCollection queryParameters = ParseQueryString(args);
            if (queryParameters[Constants.BrowseQueryParameter] != null)
            {
                OpenDialog(queryParameters[Constants.BrowseQueryParameter]);
            }
        }

        private NameValueCollection ParseQueryString(string url)
        {
            Uri uri = new Uri(url);
            return HttpUtility.ParseQueryString(uri.Query);
        }

        private void OpenDialog(string browseType)
        {
            switch (browseType)
            {
                case Constants.BrowseTypeFolder:
                    using (var folderDialog = new FolderBrowserDialog())
                    {
                        if (folderDialog.ShowDialog() == DialogResult.OK)
                        {
                            var selectedPath = folderDialog.SelectedPath;
                            this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<string>
                            {
                                Action = DATSActions.FolderSelected,
                                Source = DATSSource.Desktop,
                                Payload = selectedPath
                            }));
                        }
                        else
                        {
                            this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<string>
                            {
                                Action = DATSActions.Cancelled,
                                Source = DATSSource.Desktop
                            }));
                        }
                    }
                    break;
                default:
                    this.serviceCommunicator.PostMessage(JsonSerializer.Serialize(new MessageContract<string>
                    {
                        Action = DATSActions.Error,
                        Source = DATSSource.Desktop,
                        Payload = $"Unknown browse type: {browseType}"
                    }));
                    break;
            }
            Close();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.serviceCommunicator.PostMessage("test pipe communication");
        }
    }
}
