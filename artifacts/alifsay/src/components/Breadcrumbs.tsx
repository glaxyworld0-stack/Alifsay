import React from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex text-xs text-muted-foreground whitespace-nowrap overflow-x-auto py-2">
      <Link href="/" className="hover:text-foreground transition-colors flex items-center">
        Home
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors flex items-center truncate">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground truncate">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
