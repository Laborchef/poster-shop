import PDFDocument from 'pdfkit'

interface LaufzettelData {
  orderNumber: string
  customer: {
    name: string
    address: string
    city: string
    zip: string
  }
  order: {
    format: string
    material: string
    quantity: number
    pricePoster: string
    priceShipping: string
    priceTotal: string
    paid: boolean
    paymentMethod: string
    filename: string
  }
}

export async function generateLaufzettel(data: LaufzettelData): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const buffers: Buffer[] = []
  
  doc.on('data', (chunk) => buffers.push(chunk))
  
  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('DRUCK-LAUFZETTEL', 50, 50)
  doc.fontSize(12).font('Helvetica').text(`Order: ${data.orderNumber}`, 50, 85)
  doc.moveTo(50, 105).lineTo(550, 105).stroke()
  
  // Kunde
  doc.fontSize(14).font('Helvetica-Bold').text('KUNDE', 50, 125)
  doc.fontSize(11).font('Helvetica')
  doc.text(data.customer.name, 50, 150)
  doc.text(data.customer.address, 50, 165)
  doc.text(`${data.customer.zip} ${data.customer.city}`, 50, 180)
  
  // Bestellung
  doc.fontSize(14).font('Helvetica-Bold').text('BESTELLUNG', 50, 220)
  doc.fontSize(11).font('Helvetica')
  doc.text(`Format: ${data.order.format}`, 50, 245)
  doc.text(`Material: ${data.order.material}`, 50, 262)
  doc.text(`Menge: ${data.order.quantity} Stück`, 50, 279)
  
  // Preis
  doc.fontSize(14).font('Helvetica-Bold').text('PREIS', 50, 320)
  doc.fontSize(11).font('Helvetica')
  doc.text(`Poster:    ${data.order.pricePoster}`, 50, 345)
  doc.text(`Versand:   ${data.order.priceShipping}`, 50, 362)
  doc.moveTo(50, 385).lineTo(200, 385).stroke()
  doc.font('Helvetica-Bold').text(`Gesamt:    ${data.order.priceTotal}`, 50, 395)
  doc.font('Helvetica').text(`Status:    ${data.order.paid ? 'BEZAHLT' : 'OFFEN'} (${data.order.paymentMethod})`, 50, 415)
  
  // Datei
  doc.fontSize(14).font('Helvetica-Bold').text('DATEI', 50, 460)
  doc.fontSize(11).font('Helvetica').text(data.order.filename, 50, 485)
  
  // Checkliste
  doc.moveTo(50, 550).lineTo(550, 550).stroke()
  doc.fontSize(14).font('Helvetica-Bold').text('PRODUKTION', 50, 570)
  
  doc.fontSize(12).font('Helvetica')
  const checklistY = 600
  doc.rect(50, checklistY, 20, 20).stroke()
  doc.text('Gedruckt', 80, checklistY + 4)
  
  doc.rect(50, checklistY + 35, 20, 20).stroke()
  doc.text('Qualitätsprüfung OK', 80, checklistY + 39)
  
  doc.rect(50, checklistY + 70, 20, 20).stroke()
  doc.text('Geschnitten', 80, checklistY + 74)
  
  doc.rect(50, checklistY + 105, 20, 20).stroke()
  doc.text('Verpackt', 80, checklistY + 109)
  
  // Unterschrift
  doc.fontSize(11).text('Mitarbeiter: _________________________', 50, 750)
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 50, 775)
  
  doc.end()
  
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers))
    })
  })
}