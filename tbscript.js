const canvas = document.getElementById('bookCanvas');
const ctx = canvas.getContext('2d');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');

let bookContent = null;
let currentPage = 0;
let isAnimating = false;

async function loadBookContent() {
    const response = await fetch('tagebuch.json');
    bookContent = await response.json();
    drawBook();
}

function drawBook() {
    const pageWidth = 350;
    const pageHeight = 500;
    const bookX = 75;
    const bookY = 50;
    const pageMargin = 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw book cover
    if (currentPage === 0) {
        ctx.fillStyle = '#b5651d';
        ctx.fillRect(bookX - 20, bookY - 20, pageWidth * 2 + pageMargin + 40, pageHeight + 40);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(bookContent.cover.title, bookX + 250, bookY + 40);
        ctx.font = '16px Arial';
        ctx.fillText(bookContent.cover.author, bookX + 270, bookY + 70);
    }

    // Draw left page
    ctx.fillStyle = '#fff';
    ctx.fillRect(bookX, bookY, pageWidth, pageHeight);
    ctx.strokeRect(bookX, bookY, pageWidth, pageHeight);

    // Draw right page
    ctx.fillStyle = '#fff';
    ctx.fillRect(bookX + pageWidth + pageMargin, bookY, pageWidth, pageHeight);
    ctx.strokeRect(bookX + pageWidth + pageMargin, bookY, pageWidth, pageHeight);

    // Draw book spine
    ctx.fillStyle = '#d3d3d3';
    ctx.fillRect(bookX + pageWidth, bookY, pageMargin, pageHeight);

    // Draw text on left page
    if (currentPage > 0) {
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        wrapText(ctx, bookContent.pages[currentPage - 1].left, bookX + 20, bookY + 40, pageWidth - 40, 24);
    }

    // Draw text on right page
    if (currentPage > 0) {
        wrapText(ctx, bookContent.pages[currentPage - 1].right, bookX + pageWidth + pageMargin + 20, bookY + 40, pageWidth - 40, 24);
    }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

function animatePageTurn(direction) {
    isAnimating = true;
    const pageWidth = 350;
    const bookX = 75;
    const bookY = 50;
    const pageHeight = 500;
    const pageMargin = 10;
    const frameCount = 20;
    const frameTime = 20;
    let frame = 0;

    function turn() {
        frame++;
        if (frame > frameCount) {
            currentPage += direction === 'next' ? 1 : -1;
            isAnimating = false;
            drawBook();
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBook();

        const progress = frame / frameCount;
        const angle = direction === 'next' ? Math.PI * progress : Math.PI * (1 - progress);
        const translateX = bookX + pageWidth + pageMargin / 2;
        const translateY = bookY + pageHeight / 2;

        ctx.save();
        ctx.translate(translateX, translateY);
        ctx.rotate(angle);
        ctx.translate(-translateX, -translateY);

        if (direction === 'next') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(bookX + pageWidth + pageMargin, bookY, pageWidth, pageHeight);
            ctx.strokeRect(bookX + pageWidth + pageMargin, bookY, pageWidth, pageHeight);
            wrapText(ctx, bookContent.pages[currentPage - 1].right, bookX + pageWidth + pageMargin + 20, bookY + 40, pageWidth - 40, 24);
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(bookX, bookY, pageWidth, pageHeight);
            ctx.strokeRect(bookX, bookY, pageWidth, pageHeight);
            wrapText(ctx, bookContent.pages[currentPage - 1].left, bookX + 20, bookY + 40, pageWidth - 40, 24);
        }

        ctx.restore();
        setTimeout(turn, frameTime);
    }

    turn();
}

prevButton.addEventListener('click', () => {
    if (currentPage > 0 && !isAnimating) {
        animatePageTurn('prev');
    }
});

nextButton.addEventListener('click', () => {
    if (currentPage < bookContent.pages.length && !isAnimating) {
        animatePageTurn('next');
    }
});

loadBookContent();