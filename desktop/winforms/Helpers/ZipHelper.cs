using DATSCompanion.Shared.Models;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DATSCompanionApp.Helpers
{
    public  class ZipHelper
    {
        public static async Task CreateFromDirectoryWithProgressAsync(string sourceDirectoryName, string destinationArchiveFileName, IProgress<ReportProgress> progress)
        {
            var files = Directory.GetFiles(sourceDirectoryName, "*", SearchOption.AllDirectories);
            int totalFiles = files.Length;
            int filesProcessed = 0;

            using (var zipToCreate = new FileStream(destinationArchiveFileName, FileMode.Create))
            using (var archive = new ZipArchive(zipToCreate, ZipArchiveMode.Create))
            {
                foreach (var file in files)
                {
                    var relativePath = file.Substring(sourceDirectoryName.Length + 1); // Get relative path

                    await Task.Run(() =>
                    {
                        var entry = archive.CreateEntry(relativePath, CompressionLevel.Fastest);

                        using (var entryStream = entry.Open())
                        using (var fileStream = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true))
                        {
                            fileStream.CopyTo(entryStream);
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
        }
    }
}
