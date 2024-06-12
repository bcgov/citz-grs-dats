using System.Collections.Specialized;
using System.Web;

namespace DATSCompanionApp
{
    public partial class MainForm : Form
    {
        public MainForm(string[] args)
        {
            InitializeComponent();
            this.Text = Constants.ApplicationWindowTitle;

            if (args.Length > 0)
            {
                string protocolArgument = args[0];
                ProcessCommandLineArgs(protocolArgument);
            }
        }

        public void ProcessCommandLineArgs(string args)
        {
            NameValueCollection queryParameters = ParseQueryString(args);
            if (queryParameters["browse"] != null)
            {
                OpenDialog(queryParameters["browse"]);
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
                case "folder":
                    using (var folderDialog = new FolderBrowserDialog())
                    {
                        if (folderDialog.ShowDialog() == DialogResult.OK)
                        {
                            MessageBox.Show($"Selected Folder: {folderDialog.SelectedPath}");
                        }
                    }
                    break;
                case "file":
                    using (var fileDialog = new OpenFileDialog())
                    {
                        if (fileDialog.ShowDialog() == DialogResult.OK)
                        {
                            MessageBox.Show($"Selected File: {fileDialog.FileName}");
                        }
                    }
                    break;
                case "singlefolder":
                    // Implement single folder browser dialog if different from FolderBrowserDialog
                    break;
                case "singlefile":
                    using (var singleFileDialog = new OpenFileDialog())
                    {
                        singleFileDialog.Multiselect = false;
                        if (singleFileDialog.ShowDialog() == DialogResult.OK)
                        {
                            MessageBox.Show($"Selected File: {singleFileDialog.FileName}");
                        }
                    }
                    break;
                default:
                    MessageBox.Show("Unknown browse type.");
                    break;
            }
            Close();
        }
    }
}
