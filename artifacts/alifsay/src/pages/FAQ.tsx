import React from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      category: "Shipping & Delivery",
      items: [
        {
          q: "Do you ship internationally?",
          a: "Yes, we ship worldwide via DHL Express. Shipping is complimentary on all orders over $300 (or equivalent in your local currency)."
        },
        {
          q: "How long will my order take to arrive?",
          a: "For ready-to-wear items, delivery takes 3-5 business days to the UK/Europe, 4-6 days to North America, and 5-7 days elsewhere. Custom-sized or made-to-order items (like bridal wear) require an additional 2-4 weeks for production."
        },
        {
          q: "Will I have to pay customs duties and taxes?",
          a: "For orders to the US, UK, EU, and Australia, we cover all customs duties and import taxes (DDP). The price you see at checkout is the final price. For other regions, customs duties may apply depending on local regulations."
        }
      ]
    },
    {
      category: "Sizing & Fit",
      items: [
        {
          q: "How do I know my size?",
          a: "Each product page features a detailed Size Guide with conversions for US, UK, and EU sizing, along with exact measurements in inches. If you fall between sizes, we recommend selecting the Custom Size option."
        },
        {
          q: "How does the 'Custom Size' option work?",
          a: "When you select 'Custom Size' and place your order, our concierge team will contact you via WhatsApp or email within 24 hours. We will provide a measurement chart and guide you through taking your exact measurements for a bespoke fit."
        }
      ]
    },
    {
      category: "Returns & Exchanges",
      items: [
        {
          q: "What is your return policy?",
          a: "We offer a 14-day global return policy for all standard ready-to-wear items. The items must be unworn, with all tags attached. Please note that Custom Size and Bridal orders are final sale and cannot be returned unless there is a manufacturing defect."
        },
        {
          q: "How do I initiate a return?",
          a: "Please email concierge@alifsay.com with your order number. We will provide a DHL return label. A return shipping fee of $25 will be deducted from your refund."
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[70vh]">
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      
      <div className="text-center mb-16 mt-8">
        <h1 className="font-serif text-4xl mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground font-light">Find answers to common questions about ordering, shipping, and returns.</p>
      </div>

      <div className="space-y-12">
        {faqs.map((group, idx) => (
          <div key={idx}>
            <h2 className="font-serif text-2xl mb-6 border-b pb-2">{group.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {group.items.map((faq, i) => (
                <AccordionItem key={i} value={`item-${idx}-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-muted/30 p-10 text-center border">
        <h3 className="font-serif text-2xl mb-3">Still have questions?</h3>
        <p className="text-muted-foreground mb-6 font-light">Our concierge team is here to help you with any inquiries.</p>
        <div className="flex gap-4 justify-center">
          <a href="/contact" className="bg-foreground text-background px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-foreground/90 transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
