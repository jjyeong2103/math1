document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const table = document.getElementById('data-table');
    const lineChartButton = document.getElementById('line-chart-button');
    const clearLineChartButton = document.getElementById('clear-line-chart-button');
    const ctx = document.getElementById('chart').getContext('2d');
    let chart;
    let csvData = [];

    // CSV 파일 업로드
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'text/csv') {
                alert('CSV 파일만 업로드할 수 있습니다.');
                return;
            }
            Papa.parse(file, {
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
        backgroundColor: 'blue', // 점 색깔을 파란색으로 고정
        borderColor: 'blue', // 점 경계 색깔도 파란색으로 고정
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
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: data[0][1],
                        color: 'black'
                    }
                }
            }
        }
    });
}

    // 버튼 활성화/비활성화 및 표시/숨기기 함수
    function toggleLineChartButtons(isLineChartVisible) {
        if (isLineChartVisible) {
            lineChartButton.style.display = 'none'; // 꺾은선 그래프 그리기 버튼 숨기기
            clearLineChartButton.style.display = 'inline-block'; // 꺾은선 그래프 지우기 버튼 보이기
        } else {
            lineChartButton.style.display = 'inline-block'; // 꺾은선 그래프 그리기 버튼 보이기
            clearLineChartButton.style.display = 'none'; // 꺾은선 그래프 지우기 버튼 숨기기
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
            toggleLineChartButtons(true); // 꺾은선 그래프가 보이므로 버튼 상태 변경
        } else {
            alert('꺾은선 그래프를 그릴 데이터 포인트가 없습니다.');
        }
    });

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
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: csvData[0][1],
                            color: 'black'
                        }
                    }
                }
            }
        });
    }

    // 꺾은선 그래프 지우기
    clearLineChartButton.addEventListener('click', function() {
        if (chart) {
            chart.destroy();
        }
        renderScatterChart(csvData); // 점 그래프만 다시 그리기
        toggleLineChartButtons(false); // 꺾은선 그래프가 사라졌으므로 버튼 상태 변경
    });

    // 초기 상태에서 꺾은선 그래프 관련 버튼 비활성화
    toggleLineChartButtons(false);
});


// 그래프 다운로드 버튼 이벤트 리스너 추가
document.getElementById('download-chart-button').addEventListener('click', function() {
    const link = document.createElement('a');
    link.href = chart.toBase64Image(); // 차트를 이미지로 변환
    link.download = 'chart.png'; // 다운로드할 파일 이름 설정
    link.click(); // 링크 클릭
});