import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Be an Enrolled Agent in USA',
  description: 'Guia Completo - Contador Brasileiro → EA Certificado',
};

export default function USAEAPage() {
  return (
    <div className="w-full" style={{ height: 'calc(100vh - 72px)' }}>
      <iframe
        src="/fbrapps/usaEA/index.html"
        className="w-full h-full border-none"
        title="Be an Enrolled Agent in USA"
      />
    </div>
  );
}
