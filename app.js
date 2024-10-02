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
            complete: function(results) {
                csvData = results.data;
                renderTable(csvData);
                renderGraph(csvData);
            }
        });
    }
});

function renderTable(data) {
    table.innerHTML = '';
    const headerRow = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = 1; i < data.length; i++) {
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
    const labels = data.slice(1).map(row => row[0]);
    const values = data.slice(1).map(row => row[1]);

    const datasets = [{
        label: '데이터',
        data: data.slice(1).map(row => ({ x: parseFloat(row[0]), y: parseFloat(row[1]) })),
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
            labels: labels,
            datasets: datasets
        },
        options: {
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

trendlineButton.addEventListener('click', function() {
    const points = csvData.slice(1).map(row => ({ x: parseFloat(row[0]), y: parseFloat(row[1]) }));
    const trendline = calculateTrendline(points);
    
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
