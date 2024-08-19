using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
namespace TestApplication
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            string filePath = GetSaveFilePath();
            if (string.IsNullOrEmpty(filePath))
            {
                MessageBox.Show("Please select a path");
                return;
            }

            if (long.TryParse(textBox1.Text, out long fileSizeInBytes))
            {
                GenerateRandomFile(filePath, fileSizeInBytes * 1024 * 1024);
                MessageBox.Show("File generated");
            }
            else
            {
                MessageBox.Show("Please provide valid size");
            }

        }

        private string GetSaveFilePath()
        {
            using (SaveFileDialog saveFileDialog = new SaveFileDialog())
            {
                saveFileDialog.Filter = "Binary files (*.bin)|*.bin|All files (*.*)|*.*";
                saveFileDialog.DefaultExt = "bin";
                saveFileDialog.AddExtension = true;

                if (saveFileDialog.ShowDialog() == DialogResult.OK)
                {
                    return saveFileDialog.FileName;
                }
            }
            return null;
        }
        private void GenerateRandomFile(string path, long sizeInBytes)
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                byte[] buffer = new byte[8192];
                using (var fileStream = new FileStream(path, FileMode.Create, FileAccess.Write))
                {
                    long bytesRemaining = sizeInBytes;

                    while (bytesRemaining > 0)
                    {
                        rng.GetBytes(buffer);
                        int bytesToWrite = (int)Math.Min(buffer.Length, bytesRemaining);
                        fileStream.Write(buffer, 0, bytesToWrite);
                        bytesRemaining -= bytesToWrite;
                    }
                }
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {
            string filePath = GetOpenFilePath();
            if (string.IsNullOrEmpty(filePath))
            {
                MessageBox.Show("Please select a path");
                return;
            }

            // Perform operations with the selected file
            AddLineToTextBox($"Selected folder: {filePath}");
            TechnicalMetadataGenerator.Generate(filePath, AddLineToTextBox);
            //var buffer = ReadFile(filePath);
            //CalculateAndLogSHA1(buffer);
            //CalculateAndLogMD5(buffer);
        }

        static string GetOpenFilePath()
        {
            using (var openFileDialog = new FolderBrowserDialog())
            {
                if (openFileDialog.ShowDialog() == DialogResult.OK)
                {
                    return openFileDialog.SelectedPath;
                }
            }
            return null;
        }
        private byte[] ReadFile(string path)
        {
            Stopwatch stopwatch = new Stopwatch();

            // Time for reading file
            stopwatch.Start();
            byte[] fileBytes = File.ReadAllBytes(path);
            stopwatch.Stop();
            AddLineToTextBox($"Time taken to read file: {stopwatch.ElapsedMilliseconds} ms");
            return fileBytes;
        }
        private void CalculateAndLogSHA1(byte[] fileBytes)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();

            using (var sha1 = SHA1.Create())
            {
                var hashBytes = sha1.ComputeHash(fileBytes);
                stopwatch.Stop();
                string hashString = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
                AddLineToTextBox($"SHA1 hash: {hashString}");
                AddLineToTextBox($"Time taken to calculate SHA1: {stopwatch.ElapsedMilliseconds} ms");
            }
        }
        private void CalculateAndLogMD5(byte[] fileBytes)
        {
            Stopwatch stopwatch = new Stopwatch();

            // Time for reading file
            stopwatch.Start();

            using (MD5 md5 = MD5.Create())
            {
                byte[] hashBytes = md5.ComputeHash(fileBytes);
                stopwatch.Stop();
                string hashString = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
                AddLineToTextBox($"MD5 hash: {hashString}");
                AddLineToTextBox($"Time taken to calculate MD5: {stopwatch.ElapsedMilliseconds} ms");
            }
        }
        private void AddLineToTextBox(string text) { 
            textBox2.AppendText(text);
            textBox2.AppendText(Environment.NewLine);
        }    }
}
