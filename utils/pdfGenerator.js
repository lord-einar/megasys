const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');

const compileTemplate = async (templateName, data) => {
    const filePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    const html = fs.readFileSync(filePath, 'utf-8');
    return hbs.compile(html)(data);
};

const generatePDF = async (data, idRemito) => {
    const formattedDate = new Date(data.fecha_remito).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const templateData = {
        ...data,
        fecha_remito: formattedDate
    };

    const content = await compileTemplate('remitoTemplate', templateData);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(content);
    const pdfPath = path.join(__dirname, '..', 'remitos', `${idRemito}_${formattedDate.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4' });

    await browser.close();

    return pdfPath;
};

module.exports = generatePDF;
