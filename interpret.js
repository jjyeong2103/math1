import { font } from './NanumGothic-normal.js';

window.onload = function() {
    const imageSrc = localStorage.getItem('graphImage');
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');

    if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the graph image on the canvas
        };
    } else {
        console.error('그래프 이미지가 로컬 스토리지에 없습니다.');
    }
};


// // 차트 데이터 저장
// localStorage.setItem('chartData', JSON.stringify(chartData));
// localStorage.setItem('chartOptions', JSON.stringify(chartOptions));

// // 차트 불러오기
// const savedData = JSON.parse(localStorage.getItem('chartData'));
// const savedOptions = JSON.parse(localStorage.getItem('chartOptions'));

// const ctx = document.getElementById('chart').getContext('2d');
// const chart = new Chart(ctx, {
//     type: 'line',
//     data: savedData,
//     options: savedOptions
// });




// PDF 다운로드 기능
document.getElementById('download-pdf-button').addEventListener('click', async function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Add the font to jsPDF's VFS (Virtual File System)
    pdf.addFileToVFS("NanumGothic.ttf", font);
    pdf.addFont("NanumGothic.ttf", "NanumGothic", "normal");
    pdf.setFont("NanumGothic"); // Set the font

    // Fetch the title and interpretation from the input fields
    const title = document.getElementById('graph-title').value;
    const nameID = document.getElementById('name-id').value;
    const interpretation = document.getElementById('graph-interpretation').value;

    // Add the title to the PDF
    pdf.setFontSize(16);
    const titleWidth = pdf.getTextWidth(title);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const titleX = (pageWidth - titleWidth) / 2; // Calculate X position for center alignment
    pdf.text(title, titleX, 10);

    // Add the title to the PDF
    pdf.setFontSize(10);
    const nameIDWidth = pdf.getTextWidth(nameID);
    const nameIDX = pageWidth - nameIDWidth - 30; // Calculate X position for right alignment
    pdf.text(nameID, nameIDX, 15);
    // Add the chart image to the PDF
    const canvas = document.getElementById('chart');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 30, 180, 90); // Position and size of the image

    // Add the interpretation text
    pdf.setFontSize(12);
    pdf.text(interpretation, 20, 130); // Position of the interpretation text

    // Save the PDF with a custom name
    pdf.save('그래프_해석.pdf');
});
