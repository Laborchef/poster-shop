import { getPrinterStatus } from '@/lib/printer/snmp-client'
import { NextResponse } from 'next/server'

export async function GET() {
  const ip = process.env.PRINTER_IP!
  const community = process.env.PRINTER_SNMP_COMMUNITY || 'public'
  
  if (!ip || ip === '192.168.1.xxx') {
    return NextResponse.json(
      { error: 'Printer IP not configured', online: false },
      { status: 503 }
    )
  }
  
  try {
    const status = await getPrinterStatus(ip, community)
    
    // Check for low ink alerts
    const lowInks = []
    if (status.inks.cyan < 30) lowInks.push('Cyan')
    if (status.inks.magenta < 30) lowInks.push('Magenta')
    if (status.inks.yellow < 30) lowInks.push('Yellow')
    if (status.inks.black < 30) lowInks.push('Black')
    if (status.inks.lightCyan < 30) lowInks.push('Light Cyan')
    if (status.inks.lightMagenta < 30) lowInks.push('Light Magenta')
    
    return NextResponse.json({
      ...status,
      alerts: {
        lowInk: lowInks,
        criticalInk: lowInks.filter((ink) => {
          const level = status.inks[ink.toLowerCase().replace(' ', '') as keyof typeof status.inks]
          return level < 10
        }),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, online: false },
      { status: 500 }
    )
  }
}