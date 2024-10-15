document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const table = document.getElementById('data-table');
    const lineChartButton = document.getElementById('line-chart-button');
    const clearLineChartButton = document.getElementById('clear-line-chart-button');
    const downloadChartButton = document.getElementById('download-chart-button');
    const interpretChartButton = document.getElementById('interpret-chart-button'); // 해석하기 버튼
    const ctx = document.getElementById('chart').getContext('2d');
    let chart;
    let csvData = [];




    // 해석하기 버튼 클릭 이벤트 추가
    // Add this code to the event listener for the 'interpretChartButton'
    interpretChartButton.addEventListener('click', function() {
        if (chart) {
            // Convert the chart to a Base64 image
            const graphImage = chart.toBase64Image();
            
            // Save the image to localStorage
            localStorage.setItem('graphImage', graphImage);
            
            // Redirect to interpret.html
            window.location.href = 'interpret.html';
        } else {
            alert('그래프가 그려져 있지 않습니다.');
        }
    });

    // CSV 파일 업로드
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'text/csv') {
                alert('CSV 파일만 업로드할 수 있습니다.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result; // UTF-8로 디코딩된 텍스트
                Papa.parse(text, {
                    header: false,
                    complete: function(results) {
                        csvData = results.data;
                        if (csvData.length > 1 && csvData[0].length >= 2) {
                            renderTable(csvData);
                            renderScatterChart(csvData);
                        } else {
                            alert('CSV 파일에 유효한 데이터가 없습니다.');
                        }
                    },
                    error: function(err) {
                        console.error('파일 파싱 오류:', err);
                        alert('CSV 파일을 읽는 데 오류가 발생했습니다: ' + err.message);
                    }
                });
            };
            reader.readAsText(file, 'euc-kr'); // UTF-8로 읽기
        }
    });

    // 데이터 테이블 렌더링
    function renderTable(data) {
        table.innerHTML = '';
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th>X</th><th>Y</th>`;
        table.appendChild(headerRow);

        for (let i = 0; i < data.length; i++) {
            const row = document.createElement('tr');
            data[i].forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                row.appendChild(td);
            });
            table.appendChild(row);
        }
    }

    // 점 그래프 그리기
    function renderScatterChart(data) {
        const datasets = [{
            label: '데이터',
            data: data.slice(1).map(row => ({
                x: parseFloat(row[0]),
                y: parseFloat(row[1])
            })).filter(point => !isNaN(point.x) && !isNaN(point.y)),
            backgroundColor: 'blue',
            borderColor: 'blue',
            pointRadius: 5,
            showLine: false
        }];

        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: data[0][0],
                            color: 'black'
                        },
                        ticks: {
                            callback: function(value) {
                                return value; // 쉼표 없이 숫자 표시
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: data[0][1],
                            color: 'black'
                        },
                        ticks: {
                            callback: function(value) {
                                return value; // 쉼표 없이 숫자 표시
                            }
                        }
                    }
                }
            }
        });
    }

    // 꺾은선 그래프 렌더링
    function renderLineChart(points) {
        const datasets = [{
            label: '꺾은선 그래프',
            data: points,
            backgroundColor: 'blue',
            borderColor: 'blue',
            fill: false,
            borderWidth: 2,
            pointRadius: 5
        }];

        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: csvData[0][0],
                            color: 'black'
                        },
                        ticks: {
                            callback: function(value) {
                                return value; // 쉼표 없이 숫자 표시
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: csvData[0][1],
                            color: 'black'
                        },
                        ticks: {
                            callback: function(value) {
                                return value; // 쉼표 없이 숫자 표시
                            }
                        }
                    }
                }
            }
        });
    }

    // 버튼 활성화/비활성화 및 표시/숨기기 함수
    function toggleLineChartButtons(isLineChartVisible) {
        if (isLineChartVisible) {
            lineChartButton.style.display = 'none';
            clearLineChartButton.style.display = 'inline-block';
        } else {
            lineChartButton.style.display = 'inline-block';
            clearLineChartButton.style.display = 'none';
        }
    }

        // 꺾은선 그래프 그리기
    lineChartButton.addEventListener('click', function() {
        const points = csvData.slice(1).map(row => ({
            x: parseFloat(row[0]),
            y: parseFloat(row[1])
        })).filter(point => !isNaN(point.x) && !isNaN(point.y));

        if (points.length > 0) {
            renderLineChart(points);
            toggleLineChartButtons(true);
        } else {
            alert('꺾은선 그래프를 그릴 데이터 포인트가 없습니다.');
        }
    });

    // 꺾은선 그래프 지우기
    clearLineChartButton.addEventListener('click', function() {
        if (chart) {
            chart.destroy();
        }
        renderScatterChart(csvData);
        toggleLineChartButtons(false);
    });

    // 초기 상태에서 꺾은선 그래프 관련 버튼 비활성화
    toggleLineChartButtons(false);

    // 그래프 다운로드 버튼 이벤트 리스너 추가
    downloadChartButton.addEventListener('click', function() {
        if (chart) {
            const downloadCanvas = document.createElement('canvas');
            const downloadCtx = downloadCanvas.getContext('2d');
            downloadCanvas.width = ctx.canvas.width; 
            downloadCanvas.height = ctx.canvas.height;

            downloadCtx.fillStyle = 'white';
            downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

            const image = chart.toBase64Image();
            const img = new Image();
            img.src = image;
            img.onload = function() {
                downloadCtx.drawImage(img, 0, 0); 
                const link = document.createElement('a');
                link.href = downloadCanvas.toDataURL('image/png');
                link.download = '그래프.png'; 
                link.click();
            };
        } else {
            alert('그래프가 그려져 있지 않습니다.');
        }
    });

    // PDF 다운로드 기능
    document.getElementById('download-pdf-button').addEventListener('click', async function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // 한글 폰트 추가
    pdf.addFileToVFS("NanumGothic.ttf", "AAEAAwANAEAAIAAAABAAEAAEAAAABQAAQAAAAEAAIAAAABAAAAFAAAAAEAAAAIABAAAAEAAAABAAAABAAABAAAABQAAEAAEAAEAAEAA...");

});


});

