import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTrackOrder, getTrackOrderQueryKey } from '@workspace/api-client-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrackOrder() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [searchQuery, setSearchQuery] = useState(initialOrderNumber);
  
  const { data: tracking, isLoading, isError, refetch } = useTrackOrder(searchQuery, {
    query: {
      enabled: !!searchQuery,
      retry: false
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchQuery(orderNumber);
      window.history.pushState({}, '', `/track-order?orderNumber=${orderNumber}`);
    }
  };

  const getStatusIcon = (status: string, index: number, total: number) => {
    if (index === 0 && tracking?.status === 'delivered') return <CheckCircle2 className="w-6 h-6 text-background" />;
    if (status.toLowerCase().includes('shipped') || status.toLowerCase().includes('transit')) return <Truck className="w-5 h-5 text-background" />;
    if (status.toLowerCase().includes('processing')) return <Package className="w-5 h-5 text-background" />;
    return <Clock className="w-5 h-5 text-background" />;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl min-h-[70vh]">
      <Breadcrumbs items={[{ label: 'Track Order' }]} />
      
      <div className="text-center mb-12 mt-8">
        <h1 className="font-serif text-4xl mb-4">Track Your Order</h1>
        <p className="text-muted-foreground font-light max-w-md mx-auto">
          Enter your order number to see the current status and tracking history of your package.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4 mb-16 max-w-lg mx-auto">
        <input 
          type="text" 
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. ORD-12345" 
          className="flex-1 border bg-transparent px-4 py-3 focus:outline-none focus:border-foreground"
          required
        />
        <Button type="submit" disabled={isLoading} className="rounded-none px-8">
          {isLoading ? 'Searching...' : 'Track'}
        </Button>
      </form>

      {isError && (
        <div className="bg-destructive/10 text-destructive p-6 text-center border border-destructive/20">
          We couldn't find an order with that number. Please check and try again.
        </div>
      )}

      {tracking && !isError && (
        <div className="bg-background border p-8 md:p-12 shadow-sm animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b pb-8">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
              <h2 className="font-serif text-2xl font-bold">{tracking.orderNumber}</h2>
            </div>
            <div className="md:text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Status</p>
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 text-sm font-medium uppercase tracking-wider rounded-sm">
                {tracking.status}
              </span>
            </div>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-border -ml-px"></div>
            
            <div className="space-y-10 relative z-10">
              {tracking.statusHistory.map((event, index) => (
                <div key={index} className="flex gap-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-background ${index === 0 ? 'bg-primary shadow-lg' : 'bg-muted-foreground'}`}>
                    {getStatusIcon(event.status, index, tracking.statusHistory.length)}
                  </div>
                  <div className="pt-2">
                    <h4 className={`font-medium ${index === 0 ? 'text-lg text-foreground' : 'text-muted-foreground'}`}>
                      {event.status}
                    </h4>
                    <p className={`text-sm mt-1 ${index === 0 ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                      {event.description}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-2 font-mono">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tracking.trackingNumber && (
            <div className="mt-12 bg-muted/30 p-6 rounded-sm border flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Carrier Tracking</p>
                <p className="font-medium font-mono">{tracking.trackingNumber}</p>
              </div>
              <Button variant="outline" className="w-full sm:w-auto rounded-none text-xs uppercase tracking-widest">
                Track on Carrier Website
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
