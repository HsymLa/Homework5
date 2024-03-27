document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('play', function() {
        function processFrame() {
            if (video.paused || video.ended) {
                return;
            }

            // Vẽ frame hiện tại của video lên canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Lấy dữ liệu hình ảnh từ canvas
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            // Chuyển đổi ảnh sang grayscale
            let grayData = new Uint8ClampedArray(data.length / 4);
            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                grayData[i / 4] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            }

            // Trích xuất biên cạnh bằng thuật toán Canny
            let cannyData = new Uint8ClampedArray(data.length / 4);
            for (let y = 1; y < canvas.height - 1; y++) {
                for (let x = 1; x < canvas.width - 1; x++) {
                    let idx = y * canvas.width + x;
                    let gx = (grayData[idx - canvas.width - 1] + 2 * grayData[idx - 1] + grayData[idx + canvas.width - 1]) -
                             (grayData[idx - canvas.width + 1] + 2 * grayData[idx + 1] + grayData[idx + canvas.width + 1]);
                    let gy = (grayData[idx - canvas.width - 1] + 2 * grayData[idx - canvas.width] + grayData[idx - canvas.width + 1]) -
                             (grayData[idx + canvas.width - 1] + 2 * grayData[idx + canvas.width] + grayData[idx + canvas.width + 1]);
                    let gradientMagnitude = Math.sqrt(gx * gx + gy * gy);
                    cannyData[idx] = gradientMagnitude > 100 ? 255 : 0;
                }
            }

            // Hiển thị ảnh kết quả lên canvas
            for (let i = 0; i < cannyData.length; i++) {
                data[i * 4] = cannyData[i];
                data[i * 4 + 1] = cannyData[i];
                data[i * 4 + 2] = cannyData[i];
            }
            ctx.putImageData(imageData, 0, 0);

            requestAnimationFrame(processFrame);
        }
        processFrame();
    });
});
