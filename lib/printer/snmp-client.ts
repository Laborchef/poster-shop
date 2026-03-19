import * as snmp from 'net-snmp'

export interface PrinterStatus {
  online: boolean
  status: 'ready' | 'printing' | 'error' | 'offline'
  inks: {
    cyan: number
    magenta: number
    yellow: number
    black: number
    lightCyan: number
    lightMagenta: number
  }
  paper: {
    loaded: boolean
    type: string
    remainingPercent: number
  }
}

// Standard SNMP OIDs for HP printers (MarkerSupplies)
const INK_OIDS = {
  cyan: '1.3.6.1.2.1.43.11.1.1.9.1.1',
  magenta: '1.3.6.1.2.1.43.11.1.1.9.1.2',
  yellow: '1.3.6.1.2.1.43.11.1.1.9.1.3',
  black: '1.3.6.1.2.1.43.11.1.1.9.1.4',
  lightCyan: '1.3.6.1.2.1.43.11.1.1.9.1.5',
  lightMagenta: '1.3.6.1.2.1.43.11.1.1.9.1.6',
}

export async function getPrinterStatus(
  ip: string,
  community: string = 'public'
): Promise<PrinterStatus> {
  const session = snmp.createSession(ip, community, {
    version: snmp.Version1,
    timeout: 5000,
  })
  
  return new Promise((resolve) => {
    const oids = Object.values(INK_OIDS)
    
    session.get(oids, (error, varbinds) => {
      session.close()
      
      if (error || !varbinds || varbinds.length === 0) {
        resolve({
          online: false,
          status: 'offline',
          inks: { cyan: 0, magenta: 0, yellow: 0, black: 0, lightCyan: 0, lightMagenta: 0 },
          paper: { loaded: false, type: '', remainingPercent: 0 },
        })
        return
      }
      
      // Extract ink levels (values are typically 0-100 or need scaling)
      const inks = {
        cyan: Math.min(100, Math.max(0, varbinds[0]?.value || 0)),
        magenta: Math.min(100, Math.max(0, varbinds[1]?.value || 0)),
        yellow: Math.min(100, Math.max(0, varbinds[2]?.value || 0)),
        black: Math.min(100, Math.max(0, varbinds[3]?.value || 0)),
        lightCyan: Math.min(100, Math.max(0, varbinds[4]?.value || 0)),
        lightMagenta: Math.min(100, Math.max(0, varbinds[5]?.value || 0)),
      }
      
      resolve({
        online: true,
        status: 'ready',
        inks,
        paper: { loaded: true, type: 'Premium Matte', remainingPercent: 100 },
      })
    })
  })
}