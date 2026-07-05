import { useEffect, useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
import { upload, preview, confirm, history } from '@/services/upload';
import type { UploadBatch } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SYSTEM_FIELDS = [
  { value: 'rank', label: 'Rank' },
  { value: 'name', label: 'Name' },
  { value: 'serial_number', label: 'Serial #' },
  { value: 'account_number', label: 'Account #' },
  { value: 'date_of_death', label: 'Date of Death' },
  { value: 'cause_of_stoppage', label: 'Cause of Stoppage' },
  { value: 'agency_name', label: 'Agency' },
  { value: 'monthly_pension', label: 'Monthly Pension' },
  { value: 'agency_deduction', label: 'Agency Deduction' },
  { value: 'fractional_days', label: 'Fractional Days' },
  { value: 'whole_months', label: 'Whole Months' },
  { value: 'amount_collected', label: 'Amount Collected' },
  { value: 'date_collected', label: 'Date Collected' },
  { value: 'status', label: 'Status' },
  { value: '', label: '— Skip —' },
];

const statusBadge: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  processing: 'secondary',
  pending: 'outline',
  failed: 'destructive',
};

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [batchId, setBatchId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<UploadBatch | null>(null);
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  async function loadBatches() {
    try {
      const data = await history();
      setBatches(data.uploads);
    } catch {
      // silent
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewData(null);
    setImportResult(null);
    setError('');

    try {
      setUploading(true);
      const result = await upload(f, setUploadProgress);
      const bid = result.upload_batch.id;
      setBatchId(bid);

      const pv = await preview(bid);
      setPreviewData({ columns: pv.columns, rows: pv.rows.slice(0, 10) });

      const initialMapping: Record<string, string> = {};
      pv.columns.forEach((col) => {
        initialMapping[col] = '';
      });
      setColumnMapping(initialMapping);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  const handleImport = useCallback(async () => {
    if (!batchId) return;
    try {
      setImporting(true);
      setError('');
      const result = await confirm(batchId);
      setImportResult(result);
      loadBatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  }, [batchId]);

  function resetUpload() {
    setFile(null);
    setBatchId(null);
    setPreviewData(null);
    setImportResult(null);
    setUploadProgress(0);
    setError('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Records</h1>
        <p className="text-sm text-muted-foreground">Import pensioner records from a CSV file.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>Select a CSV file to import pensioner records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewData && !uploading && (
            <div className="flex items-center gap-4">
              <Input type="file" accept=".csv" onChange={handleFileSelect} />
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {uploadProgress}%
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {previewData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  File: <span className="text-muted-foreground">{file?.name}</span>
                </p>
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  Change File
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Column Mapping</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Map each CSV column to the corresponding system field.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {previewData.columns.map((col) => (
                    <div key={col} className="flex items-center gap-2">
                      <span className="text-sm font-mono w-32 truncate">{col}</span>
                      <Select
                        value={columnMapping[col] ?? ''}
                        onValueChange={(v) =>
                          setColumnMapping((prev) => ({ ...prev, [col]: v }))
                        }
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {SYSTEM_FIELDS.map((sf) => (
                            <SelectItem key={sf.value} value={sf.value}>
                              {sf.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Preview (first 10 rows)</h3>
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {previewData.columns.map((col) => (
                          <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.rows.map((row, i) => (
                        <TableRow key={i}>
                          {previewData.columns.map((col) => (
                            <TableCell key={col} className="whitespace-nowrap">
                              {String(row[col] ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Button onClick={handleImport} disabled={importing}>
                {importing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Import Records</>
                )}
              </Button>
            </div>
          )}

          {importResult && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Import completed</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Success:</span>{' '}
                  {importResult.success_count}
                </div>
                <div>
                  <span className="text-muted-foreground">Errors:</span>{' '}
                  {importResult.error_count}
                </div>
                <div>
                  <span className="text-muted-foreground">Duplicates:</span>{' '}
                  {importResult.duplicate_count}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>Previous upload batches.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Duplicates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No uploads yet.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        {b.file_name}
                      </div>
                    </TableCell>
                    <TableCell>{b.total_rows}</TableCell>
                    <TableCell>{b.success_count}</TableCell>
                    <TableCell>{b.error_count}</TableCell>
                    <TableCell>{b.duplicate_count}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge[b.status] ?? 'outline'}>{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(b.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadPage;
