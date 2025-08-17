// ============================================
// backend/src/services/pdfService.js
// CORREGIDO: Path de PDFs alineado con server.js
// ============================================
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { Remito, Inventario, Sede, Personal } = require('../models');
const { logger } = require('../utils/logger');
const { formatDateES, formatDateTimeES } = require('../utils/helpers');

class PDFService {
  constructor() {
    this.browser = null;
    // ← CORREGIDO: Apuntar a /backend/uploads/pdfs (raíz del backend)
    this.pdfDir = path.join(__dirname, '../../uploads/pdfs');
    this.ensurePdfDirectory();
  }
  
  /**
   * Asegurar que existe el directorio de PDFs
   */
  async ensurePdfDirectory() {
    try {
      await fs.mkdir(this.pdfDir, { recursive: true });
      logger.info(`Directorio PDF asegurado: ${this.pdfDir}`);
    } catch (error) {
      logger.error('Error creando directorio de PDFs:', error);
    }
  }
  
  /**
   * Inicializar navegador Puppeteer
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
    }
    return this.browser;
  }
  
  /**
   * Generar PDF de remito
   */
  async generarRemitoPDF(remitoId) {
    try {
      // Obtener datos del remito
      const remito = await Remito.findByPk(remitoId, {
        include: [
          { model: Sede, as: 'sede_origen' },
          { model: Sede, as: 'sede_destino' },
          { model: Personal, as: 'solicitante' },
          { model: Personal, as: 'tecnico' },
          {
            model: Inventario,
            as: 'items',
            through: { attributes: ['cantidad', 'observaciones'] },
            include: ['tipo']
          }
        ]
      });
      
      if (!remito) {
        throw new Error('Remito no encontrado');
      }
      
      // Generar HTML del remito
      const html = this.generarHTMLRemito(remito);
      
      // Inicializar browser
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Cargar HTML
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generar PDF
      const fileName = `remito_${remito.numero_remito}_${Date.now()}.pdf`;
      const filePath = path.join(this.pdfDir, fileName);
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      await page.close();
      
      logger.info(`PDF generado: ${fileName} en ${filePath}`);
      
      // ← RETORNAR PATH RELATIVO para que coincida con server.js static middleware
      return `uploads/pdfs/${fileName}`;
    } catch (error) {
      logger.error('Error generando PDF de remito:', error);
      throw error;
    }
  }
  
  /**
   * Generar HTML de remito
   */
  generarHTMLRemito(remito) {
    const items = remito.items.map(item => `
      <tr>
        <td>${item.tipo.nombre}</td>
        <td>${item.marca} ${item.modelo}</td>
        <td>${item.service_tag || '-'}</td>
        <td>${item.numero_serie || '-'}</td>
        <td>${item.remito_inventario.cantidad}</td>
        <td>${item.remito_inventario.observaciones || '-'}</td>
      </tr>
    `).join('');
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Remito ${remito.numero_remito}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .remito-info {
      text-align: right;
    }
    
    .remito-numero {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .fecha {
      color: #666;
      margin-top: 5px;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #2563eb;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .info-item {
      margin-bottom: 8px;
    }
    
    .label {
      font-weight: 600;
      color: #666;
      display: inline-block;
      min-width: 100px;
    }
    
    .value {
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    th {
      background-color: #f3f4f6;
      color: #374151;
      font-weight: 600;
      text-align: left;
      padding: 10px;
      border: 1px solid #e5e7eb;
    }
    
    td {
      padding: 8px 10px;
      border: 1px solid #e5e7eb;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    .observaciones {
      background-color: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 5px;
      padding: 10px;
      margin-top: 10px;
    }
    
    .firma-section {
      margin-top: 50px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
    }
    
    .firma-box {
      text-align: center;
      padding-top: 60px;
      border-top: 1px solid #333;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(37, 99, 235, 0.1);
      font-weight: bold;
      z-index: -1;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 10px;
    }
    
    @media print {
      .container {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">MEGASYS</div>
  
  <div class="container">
    <div class="header">
      <div class="logo">MEGASYS</div>
      <div class="remito-info">
        <div class="remito-numero">REMITO ${remito.numero_remito}</div>
        <div class="fecha">${formatDateTimeES(remito.fecha)}</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">INFORMACIÓN DE TRASLADO</div>
      <div class="info-grid">
        <div>
          <div class="info-item">
            <span class="label">Sede Origen:</span>
            <span class="value">${remito.sede_origen.nombre_sede}</span>
          </div>
          <div class="info-item">
            <span class="label">Dirección:</span>
            <span class="value">${remito.sede_origen.direccion}</span>
          </div>
          <div class="info-item">
            <span class="label">Localidad:</span>
            <span class="value">${remito.sede_origen.localidad}, ${remito.sede_origen.provincia}</span>
          </div>
        </div>
        <div>
          <div class="info-item">
            <span class="label">Sede Destino:</span>
            <span class="value">${remito.sede_destino.nombre_sede}</span>
          </div>
          <div class="info-item">
            <span class="label">Dirección:</span>
            <span class="value">${remito.sede_destino.direccion}</span>
          </div>
          <div class="info-item">
            <span class="label">Localidad:</span>
            <span class="value">${remito.sede_destino.localidad}, ${remito.sede_destino.provincia}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">RESPONSABLES</div>
      <div class="info-grid">
        <div>
          <div class="info-item">
            <span class="label">Solicitante:</span>
            <span class="value">${remito.solicitante.nombre} ${remito.solicitante.apellido}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">${remito.solicitante.email}</span>
          </div>
        </div>
        <div>
          <div class="info-item">
            <span class="label">Técnico:</span>
            <span class="value">${remito.tecnico ? `${remito.tecnico.nombre} ${remito.tecnico.apellido}` : 'Por asignar'}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado:</span>
            <span class="value">${remito.estado.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">DETALLE DE ITEMS</div>
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Service Tag</th>
            <th>Nro. Serie</th>
            <th>Cant.</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
      </table>
    </div>
    
    ${remito.observaciones ? `
    <div class="section">
      <div class="section-title">OBSERVACIONES GENERALES</div>
      <div class="observaciones">
        ${remito.observaciones}
      </div>
    </div>
    ` : ''}
    
    <div class="firma-section">
      <div class="firma-box">
        <div>Entrega</div>
        <div style="font-size: 10px; color: #666; margin-top: 5px;">Firma y aclaración</div>
      </div>
      <div class="firma-box">
        <div>Recepción</div>
        <div style="font-size: 10px; color: #666; margin-top: 5px;">Firma y aclaración</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Este documento es válido como comprobante de traslado de equipamiento.</p>
      <p>Megasys - Sistema de Gestión de Inventario - ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }
  
  /**
   * Generar PDF de confirmación
   */
  async generarConfirmacionPDF(remitoId) {
    try {
      const remito = await Remito.findByPk(remitoId, {
        include: [
          { model: Sede, as: 'sede_origen' },
          { model: Sede, as: 'sede_destino' },
          { model: Personal, as: 'solicitante' },
          { model: Personal, as: 'tecnico' }
        ]
      });
      
      if (!remito) {
        throw new Error('Remito no encontrado');
      }
      
      const html = this.generarHTMLConfirmacion(remito);
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const fileName = `confirmacion_${remito.numero_remito}_${Date.now()}.pdf`;
      const filePath = path.join(this.pdfDir, fileName);
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      await page.close();
      
      logger.info(`PDF de confirmación generado: ${fileName}`);
      
      // ← RETORNAR PATH RELATIVO
      return `uploads/pdfs/${fileName}`;
    } catch (error) {
      logger.error('Error generando PDF de confirmación:', error);
      throw error;
    }
  }
  
  /**
   * Generar HTML de confirmación
   */
  generarHTMLConfirmacion(remito) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Confirmación - Remito ${remito.numero_remito}</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 3px solid #10b981;
      margin-bottom: 30px;
    }
    
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 18px;
      color: #666;
    }
    
    .confirmation-box {
      background-color: #ecfdf5;
      border: 2px solid #10b981;
      border-radius: 10px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    
    .check-icon {
      font-size: 48px;
      color: #10b981;
      margin-bottom: 10px;
    }
    
    .confirmation-text {
      font-size: 16px;
      font-weight: 600;
      color: #065f46;
    }
    
    .info-section {
      margin: 20px 0;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 5px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 5px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .info-label {
      font-weight: 600;
      color: #666;
    }
    
    .info-value {
      color: #333;
    }
    
    .timestamp {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      background-color: #fef3c7;
      border-radius: 5px;
    }
    
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">CONFIRMACIÓN DE RECEPCIÓN</div>
    <div class="subtitle">Remito ${remito.numero_remito}</div>
  </div>
  
  <div class="confirmation-box">
    <div class="check-icon">✓</div>
    <div class="confirmation-text">
      Los items del remito han sido recibidos correctamente
    </div>
  </div>
  
  <div class="info-section">
    <div class="info-row">
      <span class="info-label">Fecha de Entrega:</span>
      <span class="info-value">${formatDateTimeES(remito.fecha_entrega)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Fecha de Confirmación:</span>
      <span class="info-value">${formatDateTimeES(remito.fecha_confirmacion)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Sede Origen:</span>
      <span class="info-value">${remito.sede_origen.nombre_sede}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Sede Destino:</span>
      <span class="info-value">${remito.sede_destino.nombre_sede}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Solicitante:</span>
      <span class="info-value">${remito.solicitante.nombre} ${remito.solicitante.apellido}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Técnico:</span>
      <span class="info-value">${remito.tecnico.nombre} ${remito.tecnico.apellido}</span>
    </div>
  </div>
  
  <div class="timestamp">
    <strong>Confirmación Digital</strong><br>
    Este documento certifica la recepción conforme de los items detallados en el remito.<br>
    <small>Generado el ${formatDateTimeES(new Date())}</small>
  </div>
  
  <div class="footer">
    <p>Megasys - Sistema de Gestión de Inventario</p>
    <p>Este es un documento generado automáticamente con validez legal.</p>
  </div>
</body>
</html>
    `;
  }
  
  /**
   * Cerrar navegador al finalizar
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFService();