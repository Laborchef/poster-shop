import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

async function getSubscribers() {
  const supabase = await createClient()
  
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false })
  
  if (error) throw error
  return subscribers || []
}

function generateCSV(subscribers: any[]) {
  const headers = ['Email', 'First Name', 'Subscribed At', 'Source', 'Tags']
  const rows = subscribers.map(s => [
    s.email,
    s.first_name || '',
    new Date(s.subscribed_at).toISOString(),
    s.source,
    s.tags?.join(';') || ''
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

export default async function NewsletterAdminPage() {
  const subscribers = await getSubscribers()
  
  const csvData = generateCSV(subscribers)
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Newsletter Verwaltung</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktive Abonnenten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Neue diese Woche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {subscribers.filter(s => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(s.subscribed_at) > weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`}
              download={`newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`}
            >
              <Button className="w-full">
                CSV Export
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Abonnenten</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Anmeldedatum</TableHead>
                <TableHead>Quelle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Noch keine Abonnenten
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>{subscriber.first_name || '-'}</TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribed_at).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscriber.source}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Import in externe Systeme</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Mailchimp:</strong> Audience → Import Contacts → Upload CSV</p>
          <p><strong>ConvertKit:</strong> Subscribers → Import → Upload CSV</p>
          <p><strong>Sendinblue:</strong> Contacts → Import → Upload CSV</p>
        </div>
      </div>
    </div>
  )
}