import type { ReactNode } from 'react';

interface InfoPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function InfoPage({ eyebrow, title, description, children }: InfoPageProps) {
  return (
    <section className="page-stack">
      <div className="panel stack">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="muted-text">{description}</p>
      </div>
      {children}
    </section>
  );
}
