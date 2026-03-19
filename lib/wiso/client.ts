interface WisoTokenResponse {
  token: string
  expires_in: number
}

interface WisoCustomer {
  id?: string
  name: string
  street: string
  zip: string
  city: string
  country: string
  email?: string
  phone?: string
}

interface WisoInvoice {
  id?: string
  customer_id: string
  date: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    tax_rate: number
  }>
}

export class WisoClient {
  private apiKey: string
  private apiSecret: string
  private baseUrl = 'https://api.meinbuero.de/v1'
  private token: string | null = null
  
  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }
  
  private async getToken(): Promise<string> {
    if (this.token) return this.token
    
    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        ownership_id: process.env.WISO_OWNERSHIP_ID,
      }),
    })
    
    if (!response.ok) throw new Error('Failed to get WISO token')
    
    const data: WisoTokenResponse = await response.json()
    this.token = data.token
    return this.token
  }
  
  async createCustomer(customer: WisoCustomer): Promise<string> {
    const token = await this.getToken()
    
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(customer),
    })
    
    if (!response.ok) throw new Error('Failed to create WISO customer')
    
    const data = await response.json()
    return data.id
  }
  
  async createInvoice(invoice: WisoInvoice): Promise<string> {
    const token = await this.getToken()
    
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(invoice),
    })
    
    if (!response.ok) throw new Error('Failed to create WISO invoice')
    
    const data = await response.json()
    return data.id
  }
}

export const wiso = new WisoClient(
  process.env.WISO_API_KEY!,
  process.env.WISO_API_SECRET!
)