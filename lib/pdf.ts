import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';
import { InfoBoleta } from '@/app/types/infoBoleta';

/**
 * Genera un PDF de boleta usando PDFKit con estilo corporativo de CompX.
 */
export async function generarBoletaPDF(
  info: InfoBoleta,
  items: { nombre: string; cantidad: number; precioUnitario: number }[],
  subtotal: number,
  costoEnvio: number,
  total: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Paleta de colores
    const colors = {
      background: '#ffffff',
      foreground: '#171717',
      ebony50: '#f3f6fb',
      ebony100: '#e3ebf6',
      ebony200: '#cdddf0',
      ebony800: '#3f538e',
      ebony900: '#374771',
    };

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Registrar fuentes
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    doc.registerFont('Roboto', path.join(fontsDir, 'Roboto-VariableFont_wdth,wght.ttf'));
    doc.registerFont('Roboto-Italic', path.join(fontsDir, 'Roboto-Italic-VariableFont_wdth,wght.ttf'));

    // Fondo general
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

    // Header
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 80 });
    const titleY = 60;
    doc.fillColor(colors.ebony900)
      .font('Roboto')
      .fontSize(20)
      .text('COMPX - BOLETA DE VENTA', 140, titleY);

    // Fecha y hora
    const now = new Date();
    const fecha = now.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    doc.font('Roboto-Italic')
      .fontSize(10)
      .fillColor(colors.ebony800)
      .text(`Fecha: ${fecha} ${hora}`, doc.page.width - 150, titleY + 20, { align: 'right' });

    // Datos del cliente
    const clientY = titleY + 60;
    doc.roundedRect(50, clientY, doc.page.width - 100, 60, 5).fill(colors.ebony50);
    doc.fillColor(colors.foreground)
      .font('Roboto')
      .fontSize(10)
      .text(`Cliente: ${info.r_nombre}`, 60, clientY + 10)
      .text(`Identificación: ${info.r_identificacion}`, 60, clientY + 25)
      .text(`Email: ${info.r_email}`, 60, clientY + 40);

    // Dirección de envío
    const addressY = clientY + 60 + 20;
    doc.roundedRect(50, addressY, doc.page.width - 100, 160, 5).fill(colors.ebony50);
    doc.fillColor(colors.ebony900)
      .font('Roboto-Italic')
      .fontSize(10)
      .text('Dirección de envío', 60, addressY + 10);
    const addrBaseY = addressY + 30;
    doc.fillColor(colors.foreground)
      .font('Roboto')
      .fontSize(10)
      .text(`Calle: ${info.r_calle ?? 'N/A'}`, 60, addrBaseY)
      .text(`Piso: ${info.r_piso ?? 'N/A'}`, 60, addrBaseY + 15)
      .text(`Lote: ${info.r_lote ?? 'N/A'}`, 60, addrBaseY + 30)
      .text(`Distrito: ${info.r_distrito}`, 60, addrBaseY + 45)
      .text(`Provincia: ${info.r_provincia}`, 60, addrBaseY + 60)
      .text(`Departamento: ${info.r_departamento}`, 60, addrBaseY + 75)
      .text(`País: ${info.r_pais}`, 60, addrBaseY + 90);

    // Detalles de Pedido (mismo fondo que otros)
    const detailsY = addressY + 160 + 20;
    doc.roundedRect(50, detailsY, doc.page.width - 100, 80, 5).fill(colors.ebony50);
    doc.fillColor(colors.ebony900)
      .font('Roboto-Italic')
      .fontSize(10)
      .text('Detalles de Pedido', 60, detailsY + 10);
    doc.fillColor(colors.foreground)
      .font('Roboto')
      .fontSize(10)
      .text(`Tipo de pago: ${info.r_tipo_pago}`, 60, detailsY + 30)
      .text(`Método de envío: ${info.r_metodo_envio}`, 60, detailsY + 45)
      .text(`Estado: ${info.r_estado}`, 60, detailsY + 60);

    // Tabla de productos
    const tableTop = detailsY + 80 + 20;
    doc.moveDown(1);
    const cols = { producto: 50, cantidad: 300, precio: 370, subtotal: 440 };
    doc.font('Roboto-Italic').fontSize(10).fillColor(colors.ebony800)
      .text('Producto', cols.producto, tableTop)
      .text('Cant.', cols.cantidad, tableTop)
      .text('P.Unit.', cols.precio, tableTop)
      .text('Subt.', cols.subtotal, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke(colors.ebony200);
    let rowY = tableTop + 20;
    items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, rowY - 2, doc.page.width - 100, 20).fill(colors.ebony100);
      const sub = (item.precioUnitario * item.cantidad).toFixed(2);
      doc.fillColor(colors.foreground).font('Roboto').fontSize(10)
        .text(item.nombre, cols.producto, rowY)
        .text(item.cantidad.toString(), cols.cantidad, rowY)
        .text(item.precioUnitario.toFixed(2), cols.precio, rowY)
        .text(sub, cols.subtotal, rowY);
      rowY += 20;
    });

    // Totales
    const afterTableY = rowY + 10;
    doc.roundedRect(50, afterTableY, doc.page.width - 100, 60, 5).stroke(colors.ebony200);
    doc.font('Roboto-Italic').fontSize(10).fillColor(colors.ebony900)
      .text('Subtotal:', 360, afterTableY + 10)
      .text('Costo Envío:', 360, afterTableY + 25)
      .text('Total:', 360, afterTableY + 40);
    doc.font('Roboto').fontSize(10).fillColor(colors.foreground)
      .text(`S/ ${subtotal.toFixed(2)}`, doc.page.width - 150, afterTableY + 10, { align: 'right' })
      .text(`S/ ${costoEnvio.toFixed(2)}`, doc.page.width - 150, afterTableY + 25, { align: 'right' })
      .fontSize(12)
      .text(`S/ ${total.toFixed(2)}`, doc.page.width - 150, afterTableY + 40, { align: 'right' });

    // Footer
    const footerY = doc.page.height - 80;
    doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).stroke(colors.ebony200);
    doc.fillColor(colors.ebony900).font('Roboto').fontSize(8)
      .text(
        'Tlf: +51 999 999 999 • correo: compx.services@gmail.com • web: compx.com.pe • Instagram: @compx',
        50,
        footerY + 10,
        { width: doc.page.width - 100, align: 'center' }
      );

    doc.end();
  });
}