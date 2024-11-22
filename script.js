const startButton = document.getElementById('startTest');
const statusDisplay = document.getElementById('status');
const speedNeedle = document.getElementById('speedNeedle');
const downloadSpeedElement = document.getElementById('downloadSpeed');
const uploadSpeedElement = document.getElementById('uploadSpeed');

function animateNeedle(speed) {
    // 0-100 Mbps aralığında ibreli animasyon
    const angle = Math.min(speed * 1.8, 180);
    speedNeedle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

function testDownloadSpeed() {
    return new Promise((resolve) => {
        const url = 'https://speed.cloudflare.com/__down?bytes=25000000';
        const startTime = performance.now();
        
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000;
                const speedMbps = ((buffer.byteLength * 8) / duration / 1000000).toFixed(2);
                resolve(speedMbps);
            })
            .catch(() => resolve(null));
    });
}

function testUploadSpeed() {
    return new Promise((resolve) => {
        const url = 'https://speed.cloudflare.com/__up';
        const payload = new ArrayBuffer(10 * 1024 * 1024);
        const startTime = performance.now();

        fetch(url, {
            method: 'POST',
            body: payload
        })
            .then(response => {
                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000;
                const speedMbps = ((payload.byteLength * 8) / duration / 1000000).toFixed(2);
                resolve(speedMbps);
            })
            .catch(() => resolve(null));
    });
}

async function runSpeedTest() {
    startButton.disabled = true;
    statusDisplay.textContent = 'İndirme hızı ölçülüyor...';
    speedNeedle.style.transform = 'translateX(-50%) rotate(0deg)';

    try {
        const downloadSpeed = await testDownloadSpeed();
        statusDisplay.textContent = 'Yükleme hızı ölçülüyor...';
        
        const uploadSpeed = await testUploadSpeed();

        if (downloadSpeed && uploadSpeed) {
            downloadSpeedElement.textContent = `${downloadSpeed} Mbps`;
            uploadSpeedElement.textContent = `${uploadSpeed} Mbps`;
            
            // Ortalama hıza göre ibre animasyonu
            const averageSpeed = (parseFloat(downloadSpeed) + parseFloat(uploadSpeed)) / 2;
            animateNeedle(averageSpeed);
            
            statusDisplay.textContent = 'Test tamamlandı';
        } else {
            statusDisplay.textContent = 'Test başarısız oldu';
        }
    } catch (error) {
        statusDisplay.textContent = 'Bir hata oluştu';
    } finally {
        startButton.disabled = false;
    }
}

startButton.addEventListener('click', runSpeedTest);