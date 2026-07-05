<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UploadBatchResource;
use App\Models\Pensioner;
use App\Models\UploadBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenSpout\Reader\CSV\Reader;

class UploadController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $batches = UploadBatch::with('uploader')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return UploadBatchResource::collection($batches);
    }

    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $filePath = $request->file('file')->getPathname();

        $reader = new Reader;
        $reader->open($filePath);

        $headers = [];
        $rows = [];
        $rowCount = 0;

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $cells = $row->toArray();

                if (empty($headers)) {
                    $headers = $cells;

                    continue;
                }

                $rows[] = $cells;
                $rowCount++;

                if ($rowCount >= 10) {
                    break 2;
                }
            }
        }

        $reader->close();

        return response()->success([
            'headers' => $headers,
            'rows' => $rows,
            'total_rows_detected' => $this->countCsvRows($filePath),
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'column_mapping' => ['required', 'array'],
            'column_mapping.*' => ['string'],
        ]);

        $file = $request->file('file');
        $filePath = $file->getPathname();
        $columnMapping = $request->input('column_mapping');

        $reader = new Reader;
        $reader->open($filePath);

        $headers = [];
        $pensionerData = [];
        $errors = [];
        $duplicateCount = 0;
        $successCount = 0;
        $totalRows = 0;

        $allowedFields = [
            'rank', 'name', 'serial_number', 'account_number',
            'date_of_death', 'cause_of_stoppage', 'agency_name',
            'monthly_pension', 'agency_deduction', 'fractional_days',
            'whole_months', 'amount_collected', 'date_collected', 'status',
        ];

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $cells = $row->toArray();

                if (empty($headers)) {
                    $headers = $cells;

                    continue;
                }

                $totalRows++;

                $record = [];
                foreach ($columnMapping as $csvColumnIndex => $dbField) {
                    if (! in_array($dbField, $allowedFields, true)) {
                        continue;
                    }

                    $colIndex = array_search($csvColumnIndex, $headers, true);
                    if ($colIndex === false) {
                        $colIndex = is_numeric($csvColumnIndex) ? (int) $csvColumnIndex : null;
                    }

                    if ($colIndex !== null && isset($cells[$colIndex])) {
                        $record[$dbField] = $cells[$colIndex];
                    }
                }

                if (empty($record['name']) || empty($record['serial_number'])) {
                    $errors[] = "Row {$totalRows}: missing required fields (name, serial_number)";

                    continue;
                }

                $exists = Pensioner::where('serial_number', $record['serial_number'])->exists();
                if ($exists) {
                    $duplicateCount++;

                    continue;
                }

                $record['created_by'] = $request->user()->id;
                $record['status'] = $record['status'] ?? 'not-yet-recovered';

                Pensioner::create($record);
                $successCount++;
            }
        }

        $reader->close();

        $batch = UploadBatch::create([
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'total_rows' => $totalRows,
            'success_count' => $successCount,
            'error_count' => count($errors),
            'duplicate_count' => $duplicateCount,
            'errors' => $errors,
            'column_mapping' => $columnMapping,
            'status' => $successCount > 0 ? 'completed' : 'failed',
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->success([
            'batch_id' => $batch->id,
            'total_rows' => $totalRows,
            'success_count' => $successCount,
            'error_count' => count($errors),
            'duplicate_count' => $duplicateCount,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $batch = UploadBatch::with(['uploader', 'pensioners'])->findOrFail($id);

        return response()->success([
            'batch' => new UploadBatchResource($batch),
            'pensioners_count' => $batch->pensioners()->count(),
        ]);
    }

    private function countCsvRows(string $filePath): int
    {
        $reader = new Reader;
        $reader->open($filePath);

        $count = 0;

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $count++;
            }
        }

        $reader->close();

        return max(0, $count - 1);
    }
}
