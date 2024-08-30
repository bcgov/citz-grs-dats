using DATSCompanion.Shared.Models;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DATSCompanionApp.Helpers
{
    public class ZipHelper
    {
        public static async Task<MemoryStream> CreateFromDirectoryWithProgressAsync(string sourceDirectoryName,IProgress<ReportProgress> progress)
        {
            var files = Directory.GetFiles(sourceDirectoryName, "*", SearchOption.AllDirectories);
            int totalFiles = files.Length;
            int filesProcessed = 0;

            // Create a memory stream to hold the archive data
            var memoryStream = new MemoryStream();

            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (var file in files)
                {
                    var relativePath = file.Substring(sourceDirectoryName.Length + 1); // Get relative path

                    // Create each entry in a separate task
                    await Task.Run(async () =>
                    {
                        var entry = archive.CreateEntry(relativePath, CompressionLevel.Fastest);

                        using (var entryStream = entry.Open())
                        using (var fileStream = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true))
                        {
                            await fileStream.CopyToAsync(entryStream);
                        }
                    });

                    filesProcessed++;
                    int progressPercentage = (int)((double)filesProcessed / totalFiles * 100);
                    progress.Report(new ReportProgress()
                    {
                        Progress = progressPercentage,
                        ProgressMessage = "Compressing...",
                        Message = sourceDirectoryName,
                        IsIndeterminate = true
                    });
                }
            }

            // Reset the position of the memory stream to the beginning
            memoryStream.Seek(0, SeekOrigin.Begin);

            // Return the memory stream containing the ZIP archive
            return memoryStream;
        }
    }
}

