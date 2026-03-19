'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Printer } from 'lucide-react'

interface PrinterStatusData {
  online: boolean
  status: string
  inks: {
    cyan: number
    magenta: number
    yellow: number
    black: number
    lightCyan: number
    lightMagenta: number
  }
  alerts?: {
    lowInk: string[]
    criticalInk: string[]
  }
}

export function PrinterStatusWidget() {
  const [status, setStatus] = useState<PrinterStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/printer/status')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setStatus(data)
      } catch (err) {
        setError('Drucker nicht erreichbar')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])
  
  if (loading) return <div className="text-sm text-muted-foreground">Lade Druckerstatus...</div>
  if (error || !status?.online) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">Drucker offline oder nicht konfiguriert</span>
        </CardContent>
      </Card>
    )
  }
  
  const hasAlerts = status.alerts?.lowInk?.length > 0 || status.alerts?.criticalInk?.length > 0
  
  return (
    <Card className={hasAlerts ? 'border-yellow-200' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Printer className="w-4 h-4" />
          HP DesignJet Z2100
          <Badge variant={status.online ? 'default' : 'destructive'}>
            {status.online ? 'Online' : 'Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ink Levels */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'C', value: status.inks.cyan, color: 'bg-cyan-500' },
            { label: 'M', value: status.inks.magenta, color: 'bg-fuchsia-500' },
            { label: 'Y', value: status.inks.yellow, color: 'bg-yellow-500' },
            { label: 'K', value: status.inks.black, color: 'bg-gray-800' },
            { label: 'LC', value: status.inks.lightCyan, color: 'bg-cyan-300' },
            { label: 'LM', value: status.inks.lightMagenta, color: 'bg-fuchsia-300' },
          ].map((ink) => (
            <div key={ink.label} className="text-center">
              <div className="text-xs font-medium mb-1">{ink.label}</div>
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${ink.color} transition-all`}
                  style={{ width: `${ink.value}%` }}
                />
              </div>
              <div className="text-xs mt-1">{ink.value}%</div>
            </div>
          ))}
        </div>
        
        {/* Alerts */}
        {status.alerts?.criticalInk?.length > 0 && (
          <div className="bg-red-100 text-red-800 p-2 rounded text-sm">
            <strong>KRITISCH:</strong> {status.alerts.criticalInk.join(', ')} < 10%
          </div>
        )}
        {status.alerts?.lowInk?.length > 0 && status.alerts.criticalInk?.length === 0 && (
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm">
            <strong>Warnung:</strong> {status.alerts.lowInk.join(', ')} < 30%
          </div>
        )}
      </CardContent>
    </Card>
  )
}