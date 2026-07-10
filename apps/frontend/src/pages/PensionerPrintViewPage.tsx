import { useParams } from 'react-router-dom';
import { PensionerPrintView } from '@/components/pensioner/PensionerPrintView';

function PensionerPrintViewPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-8 text-center text-destructive">Invalid pensioner ID.</div>;
  }

  return <PensionerPrintView pensionerId={Number(id)} />;
}

export default PensionerPrintViewPage;
