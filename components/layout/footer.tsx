import Link from 'next/link'
import { NewsletterForm } from '@/components/newsletter/newsletter-form'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Poster Shop</h3>
            <p className="text-sm text-muted-foreground">
              Individuelle Poster mit KI-Unterstützung. Hochwertige Drucke auf Premium-Papier.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground">Shop</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Anmelden</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-foreground">Registrieren</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Neuigkeiten und Angebote direkt in Ihr Postfach.
            </p>
            <NewsletterForm />
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Poster Shop. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  )
}