const fileInput = document.getElementById('file-input');
const table = document.getElementById('data-table');
const trendlineButton = document.getElementById('trendline-button');
const ctx = document.getElementById('chart').getContext('2d');
let chart;
let csvData = [];

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: false,
            complete: function(results) {
                csvData = results.data;
                if (csvData.length > 1) {
                    renderTable(csvData);
                    renderGraph(csvData);
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

function renderGraph(data) {
    const datasets = [{
        label: '데이터',
        data: data.slice(1).map(row => ({
            x: parseFloat(row[0]),
            y: parseFloat(row[1])
        })),
        backgroundColor: 'blue',
        borderColor: 'blue',
        pointRadius: 5,
        pointBackgroundColor: 'blue',
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
                        text: 'X축',
                        color: 'black'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Y축',
                        color: 'black'
                    }
                }
            }
        }
    });
}

trendlineButton.addEventListener('click', function() {
    const points = csvData.slice(1).map(row => ({
        x: parseFloat(row[0]),
        y: parseFloat(row[1])
    })).filter(point => !isNaN(point.x) && !isNaN(point.y)); // 유효한 포인트만 필터링

    console.log('추세선 계산을 위한 포인트:', points);

    if (points.length > 0) {
        const trendline = calculateTrendline(points);
        console.log('추세선 데이터:', trendline);

        chart.data.datasets.push({
            label: '추세선',
            data: trendline,
            borderColor: 'red',
            borderWidth: 2,
            fill: false,
            type: 'line',
            pointRadius: 0
        });
        chart.update();
    } else {
        alert('추세선을 그릴 데이터 포인트가 없습니다.');
    }
});

function calculateTrendline(points) {
    const n = points.length;
    const sumX = points.reduce((acc, point) => acc + point.x, 0);
    const sumY = points.reduce((acc, point) => acc + point.y, 0);
    const sumXY = points.reduce((acc, point) => acc + point.x * point.y, 0);
    const sumX2 = points.reduce((acc, point) => acc + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const xMin = Math.min(...points.map(point => point.x));
    const xMax = Math.max(...points.map(point => point.x));

    return [
        { x: xMin, y: slope * xMin + intercept },
        { x: xMax, y: slope * xMax + intercept }
    ];
}
