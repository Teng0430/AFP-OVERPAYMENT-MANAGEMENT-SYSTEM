<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pensioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\CSV\Writer;

class ReportsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $byAgency = Pensioner::select('agency_name', DB::raw('COUNT(*) as count'))
            ->groupBy('agency_name')
            ->orderByDesc('count')
            ->get();

        $byRank = Pensioner::select('rank', DB::raw('COUNT(*) as count'))
            ->groupBy('rank')
            ->orderByDesc('count')
            ->get();

        $byStatus = Pensioner::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

<<<<<<< HEAD
        $dbDriver = DB::connection()->getDriverName();
        $dateFormat = $dbDriver === 'sqlite'
=======
        $dateFormat = DB::connection()->getDriverName() === 'sqlite'
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $monthlyTrend = Pensioner::select(
            DB::raw("{$dateFormat} as month"),
            DB::raw('COUNT(*) as count'),
            DB::raw('COALESCE(SUM(monthly_pension * fractional_days + monthly_pension * whole_months), 0) as total_overpayment'),
        )
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy(DB::raw($dateFormat))
            ->orderBy('month')
            ->get();

        return response()->success([
            'by_agency' => $byAgency,
            'by_rank' => $byRank,
            'by_status' => $byStatus,
            'monthly_trend' => $monthlyTrend,
        ]);
    }

    public function export(Request $request): JsonResponse|Response
    {
        $format = $request->input('format', 'pdf');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Pensioner::orderBy('name');

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $pensioners = $query->limit(5000)->get();

        if ($format === 'csv') {
            $filePath = tempnam(sys_get_temp_dir(), 'export_').'.csv';

            $writer = new \OpenSpout\Writer\CSV\Writer;
            $writer->openToFile($filePath);

            $writer->addRow(\OpenSpout\Common\Entity\Row::fromValues([
                'Name', 'Serial Number', 'Account Number', 'Rank', 'Agency',
                'Monthly Pension', 'Agency Deduction', 'Fractional Days in Month',
                'Whole Months', 'Amount Collected', 'Date Collected',
                'Date of Death', 'Cause of Stoppage', 'Status',
            ]));

            foreach ($pensioners as $p) {
                $writer->addRow(\OpenSpout\Common\Entity\Row::fromValues([
                    $p->name,
                    $p->serial_number,
                    $p->account_number ?? '',
                    $p->rank,
                    $p->agency_name,
                    (string) $p->monthly_pension,
                    (string) ($p->agency_deduction ?? 0),
                    (string) $p->fractional_days,
                    (string) $p->whole_months,
                    (string) $p->amount_collected,
                    $p->date_collected ?? '',
                    $p->date_of_death ?? '',
                    $p->cause_of_stoppage,
                    $p->status,
                ]));
            }

            $writer->close();

            $content = file_get_contents($filePath);
            unlink($filePath);

            return response($content, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="report-'.Carbon::now()->format('Ymd').'.csv"',
            ]);
        }

        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator(config('app.name'));
        $pdf->SetAuthor(config('app.name'));
        $pdf->SetTitle('Report');
        $pdf->SetMargins(15, 15, 15);
        $pdf->AddPage();

        $html = '<h1>Overpayment Report</h1>';
        $html .= '<p>Generated: '.Carbon::now()->format('Y-m-d H:i:s').'</p>';

        if ($dateFrom || $dateTo) {
            $html .= '<p>Date Range: '.($dateFrom ?? 'Earliest').' to '.($dateTo ?? 'Latest').'</p>';
        }

        $html .= '<table border="1" cellpadding="4" cellspacing="0">';
        $html .= '<thead><tr>
            <th>#</th><th>Name</th><th>Serial No.</th><th>Rank</th>
            <th>Agency</th><th>Monthly Pension</th><th>Overpayment</th><th>Collected</th><th>Status</th>
        </tr></thead><tbody>';

        foreach ($pensioners as $i => $p) {
            $overpayment = $p->monthly_pension * $p->fractional_days + $p->monthly_pension * $p->whole_months;
            $html .= '<tr>
                <td>'.($i + 1).'</td>
                <td>'.e($p->name).'</td>
                <td>'.e($p->serial_number).'</td>
                <td>'.e($p->rank).'</td>
                <td>'.e($p->agency_name).'</td>
                <td>'.number_format($p->monthly_pension, 2).'</td>
                <td>'.number_format($overpayment, 2).'</td>
                <td>'.number_format($p->amount_collected, 2).'</td>
                <td>'.e($p->status).'</td>
            </tr>';
        }

        $html .= '</tbody></table>';

        $pdf->writeHTML($html, true, false, true, false, '');
        $pdfContent = $pdf->Output('report.pdf', 'S');

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="report-'.Carbon::now()->format('Ymd').'.pdf"',
        ]);
    }

    public function exportPdf(Request $request): JsonResponse|Response
    {
        $type = $request->input('type', 'pensioners');

        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator(config('app.name'));
        $pdf->SetAuthor(config('app.name'));
        $pdf->SetTitle(ucfirst($type).' Report');
        $pdf->SetMargins(15, 15, 15);
        $pdf->AddPage();

        $html = '<h1>'.ucfirst($type).' Report</h1>';
        $html .= '<p>Generated: '.Carbon::now()->format('Y-m-d H:i:s').'</p>';

        if ($type === 'pensioners' || $type === 'all') {
            $pensioners = Pensioner::orderBy('name')->limit(500)->get();

            $html .= '<table border="1" cellpadding="4" cellspacing="0">';
            $html .= '<thead><tr>
                <th>#</th><th>Name</th><th>Serial No.</th><th>Rank</th>
                <th>Agency</th><th>Monthly Pension</th><th>Overpayment</th><th>Collected</th><th>Status</th>
            </tr></thead><tbody>';

            foreach ($pensioners as $i => $p) {
                $overpayment = $p->monthly_pension * $p->fractional_days + $p->monthly_pension * $p->whole_months;
                $html .= '<tr>
                    <td>'.($i + 1).'</td>
                    <td>'.e($p->name).'</td>
                    <td>'.e($p->serial_number).'</td>
                    <td>'.e($p->rank).'</td>
                    <td>'.e($p->agency_name).'</td>
                    <td>'.number_format($p->monthly_pension, 2).'</td>
                    <td>'.number_format($overpayment, 2).'</td>
                    <td>'.number_format($p->amount_collected, 2).'</td>
                    <td>'.e($p->status).'</td>
                </tr>';
            }

            $html .= '</tbody></table>';
        }

        if ($type === 'summary') {
            $byStatus = DB::table('pensioners')
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get();

            $html .= '<h2>Summary by Status</h2>';
            $html .= '<table border="1" cellpadding="4" cellspacing="0">';
            $html .= '<thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>';
            foreach ($byStatus as $row) {
                $html .= '<tr><td>'.e($row->status).'</td><td>'.$row->count.'</td></tr>';
            }
            $html .= '</tbody></table>';

            $byAgency = DB::table('pensioners')
                ->select('agency_name', DB::raw('COUNT(*) as count'))
                ->groupBy('agency_name')
                ->orderByDesc('count')
                ->get();

            $html .= '<h2>Summary by Agency</h2>';
            $html .= '<table border="1" cellpadding="4" cellspacing="0">';
            $html .= '<thead><tr><th>Agency</th><th>Count</th></tr></thead><tbody>';
            foreach ($byAgency as $row) {
                $html .= '<tr><td>'.e($row->agency_name).'</td><td>'.$row->count.'</td></tr>';
            }
            $html .= '</tbody></table>';
        }

        $pdf->writeHTML($html, true, false, true, false, '');
        $pdfContent = $pdf->Output('report.pdf', 'S');

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$type.'-report-'.Carbon::now()->format('Ymd').'.pdf"',
        ]);
    }

    public function exportCsv(Request $request): Response|JsonResponse
    {
        $pensioners = Pensioner::orderBy('name')->limit(5000)->get();

        $filePath = tempnam(sys_get_temp_dir(), 'export_').'.csv';

        $writer = new Writer;
        $writer->openToFile($filePath);

        $writer->addRow(Row::fromValues([
            'Name', 'Serial Number', 'Account Number', 'Rank', 'Agency',
            'Monthly Pension', 'Agency Deduction', 'Fractional Days in Month',
            'Whole Months', 'Amount Collected', 'Date Collected',
            'Date of Death', 'Cause of Stoppage', 'Status',
        ]));

        foreach ($pensioners as $p) {
            $writer->addRow(Row::fromValues([
                $p->name,
                $p->serial_number,
                $p->account_number ?? '',
                $p->rank,
                $p->agency_name,
                (string) $p->monthly_pension,
                (string) ($p->agency_deduction ?? 0),
                (string) $p->fractional_days,
                (string) $p->whole_months,
                (string) $p->amount_collected,
                $p->date_collected ?? '',
                $p->date_of_death ?? '',
                $p->cause_of_stoppage,
                $p->status,
            ]));
        }

        $writer->close();

        $content = file_get_contents($filePath);
        unlink($filePath);

        return response($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="pensioners-export-'.Carbon::now()->format('Ymd').'.csv"',
        ]);
    }
}
