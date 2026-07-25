import React from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />
      
      <div className="text-center mb-16 mt-8">
        <h1 className="font-serif text-4xl mb-4">Get in Touch</h1>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          Our concierge team is available to assist you with styling advice, bespoke sizing, order tracking, and any other inquiries.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Contact Form */}
        <div>
          <h2 className="font-serif text-2xl mb-8">Send a Message</h2>
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">First Name</label>
                <input type="text" className="w-full border-b border-border bg-transparent py-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">Last Name</label>
                <input type="text" className="w-full border-b border-border bg-transparent py-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">Email Address</label>
              <input type="email" className="w-full border-b border-border bg-transparent py-3 focus:outline-none focus:border-foreground transition-colors" required />
            </div>
            
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">Order Number (Optional)</label>
              <input type="text" className="w-full border-b border-border bg-transparent py-3 focus:outline-none focus:border-foreground transition-colors" />
            </div>
            
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">Message</label>
              <textarea rows={5} className="w-full border border-border bg-transparent p-3 focus:outline-none focus:border-foreground transition-colors resize-none" required></textarea>
            </div>
            
            <Button type="submit" className="w-full rounded-none py-6 uppercase tracking-widest text-xs bg-foreground text-background hover:bg-foreground/90">
              Submit Inquiry
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="bg-muted/30 p-10 lg:p-16 border">
          <h2 className="font-serif text-2xl mb-8">Contact Information</h2>
          
          <div className="space-y-10">
            <div className="flex gap-4">
              <MessageCircle className="w-6 h-6 shrink-0 text-foreground" />
              <div>
                <h3 className="font-medium uppercase tracking-wider text-sm mb-1">WhatsApp Concierge</h3>
                <p className="text-muted-foreground font-light mb-2 text-sm">Fastest response for sizing and urgent queries.</p>
                <a href="#" className="text-primary hover:underline font-medium">+44 7946 0958 12</a>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Mail className="w-6 h-6 shrink-0 text-foreground" />
              <div>
                <h3 className="font-medium uppercase tracking-wider text-sm mb-1">Email Support</h3>
                <p className="text-muted-foreground font-light mb-2 text-sm">For returns, exchanges, and general inquiries.</p>
                <a href="mailto:concierge@alifsay.com" className="text-primary hover:underline font-medium">concierge@alifsay.com</a>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Phone className="w-6 h-6 shrink-0 text-foreground" />
              <div>
                <h3 className="font-medium uppercase tracking-wider text-sm mb-1">Phone</h3>
                <p className="text-muted-foreground font-light mb-2 text-sm">Mon-Fri, 9am - 6pm (GMT)</p>
                <a href="tel:+442079460958" className="text-primary hover:underline font-medium">+44 20 7946 0958</a>
              </div>
            </div>
            
            <div className="flex gap-4">
              <MapPin className="w-6 h-6 shrink-0 text-foreground" />
              <div>
                <h3 className="font-medium uppercase tracking-wider text-sm mb-1">London HQ & Studio</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  124 Atelier Avenue<br />
                  Fashion District<br />
                  London, W1 4XY<br />
                  United Kingdom
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">*By appointment only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
