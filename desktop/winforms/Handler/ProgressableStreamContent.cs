using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace DATSCompanionService.Handler
{
    public class ProgressableStreamContent : HttpContent
    {
        private readonly Stream _stream;
        private readonly Action<long> _progress;
        private const int DefaultBufferSize = 10 * 1024 * 1024; // 10 MB buffer;

        public ProgressableStreamContent(Stream stream, Action<long> progress)
        {
            _stream = stream ?? throw new ArgumentNullException(nameof(stream));
            _progress = progress ?? throw new ArgumentNullException(nameof(progress));
        }

        protected override async Task SerializeToStreamAsync(Stream stream, TransportContext context)
        {
            var buffer = new byte[DefaultBufferSize];
            long totalBytesRead = 0;
            int bytesRead;
            while ((bytesRead = await _stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                await stream.WriteAsync(buffer, 0, bytesRead);
                totalBytesRead += bytesRead;
                _progress(totalBytesRead);
            }
        }

        protected override bool TryComputeLength(out long length)
        {
            length = _stream.Length;
            return true;
        }
    }


}
