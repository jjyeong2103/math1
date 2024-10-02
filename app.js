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
            Papa.parse(file, {
                header: false,
                complete: function(results) {
                    csvData = results.data;
                    if (csvData.length > 1) {
                        renderTable(csvData);
                        renderScatterChart(csvData); // 점 그래프 그리기
                    } else {
                        alert('CSV 파일에 데이터가 없습니다.');
                    }
                },
                error: function(err) {
                    console.error('파일 파싱 오류:', err);
                    alert('CSV 파일을 읽는 데 오류가 발생했습니다.');
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
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: data[0][0], // CSV 첫 번째 행 첫 번째 열
                            color: 'black'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: data[0][1], // CSV 첫 번째 행 두 번째 열
                            color: 'black'
                        }
                    }
                }
            }
        });
    }

    // 꺾은선 그래프 그리기
    lineChartButton.addEventListener('click', function() {
        const points = csvData.slice(1).map(row => ({
            x: parseFloat(row[0]),
            y: parseFloat(row[1])
        })).filter(point => !isNaN(point.x) && !isNaN(point.y));

        if (points.length > 0) {
            renderLineChart(points);
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
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: csvData[0][0], // CSV 첫 번째 행 첫 번째 열
                            color: 'black'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: csvData[0][1], // CSV 첫 번째 행 두 번째 열
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
    });
});
