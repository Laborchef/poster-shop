import sharp from 'sharp'
import { generateLaufzettel } from './laufzettel'
import fs from 'fs/promises'
import path from 'path'

interface PrintJob {
  orderId: string
  orderNumber: string
  imageBuffer: Buffer
  format: {
    widthMm: number
    heightMm: number
    dpi: number
  }
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
  }
}

export async function preparePrintJob(job: PrintJob): Promise<string> {
  const today = new Date().toISOString().split('T')[0]
  const folderName = `${job.orderNumber}`
  const folderPath = `/data/prints/queue/${today}/${folderName}`
  
  // Create folder
  await fs.mkdir(folderPath, { recursive: true })
  
  // Generate Laufzettel
  const laufzettelBuffer = await generateLaufzettel({
    orderNumber: job.orderNumber,
    customer: job.customer,
    order: {
      ...job.order,
      filename: 'poster.pdf',
    },
  })
  await fs.writeFile(path.join(folderPath, 'laufzettel.pdf'), laufzettelBuffer)
  
  // Process image with Sharp (convert to print-ready PDF)
  const widthPx = Math.round((job.format.widthMm / 25.4) * job.format.dpi)
  const heightPx = Math.round((job.format.heightMm / 25.4) * job.format.dpi)
  
  const posterBuffer = await sharp(job.imageBuffer)
    .resize(widthPx, heightPx, { fit: 'contain', background: 'white' })
    .png({ quality: 100 })
    .toBuffer()
  
  await fs.writeFile(path.join(folderPath, 'poster.png'), posterBuffer)
  
  return folderPath
}