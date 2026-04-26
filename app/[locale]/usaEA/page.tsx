import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Be an Enrolled Agent in USA',
  description: 'Guia Completo - Contador Brasileiro → EA Certificado',
};

export default function USAEAPage() {
  return (
    <div className="w-full flex-1 w-full" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <iframe
        src="/fbrapps/usaEA/index.html"
        className="w-full h-full border-none absolute left-0"
        style={{ minHeight: 'calc(100vh - 80px)' }}
        title="Be an Enrolled Agent in USA"
      />
    </div>
  );
}
