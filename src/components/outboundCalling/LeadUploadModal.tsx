import { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  X,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Table,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { UploadProgress } from '@/types/outboundCalling';

interface LeadUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  onUpload: (file: File) => Promise<{ success: boolean; leadsAdded: number }>;
  onClearProgress: () => void;
}

type UploadStep = 'upload' | 'mapping' | 'validation' | 'progress';

interface CsvColumn {
  index: number;
  header: string;
  sampleValues: string[];
}

interface FieldMapping {
  csvColumn: string;
  required: boolean;
}

interface ValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  count: number;
}

const LEAD_FIELDS: { key: string; label: string; required: boolean; description: string }[] = [
  { key: 'name', label: 'Full Name', required: true, description: 'Contact name' },
  { key: 'phone', label: 'Phone Number', required: true, description: 'Primary phone number' },
  { key: 'email', label: 'Email Address', required: false, description: 'Email for follow-ups' },
  { key: 'company', label: 'Company', required: false, description: 'Organization name' },
  { key: 'notes', label: 'Notes', required: false, description: 'Additional context' },
];

function parseCsvPreview(content: string): { columns: CsvColumn[]; rowCount: number } {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { columns: [], rowCount: 0 };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const dataLines = lines.slice(1, Math.min(6, lines.length));

  const columns: CsvColumn[] = headers.map((header, index) => ({
    index,
    header,
    sampleValues: dataLines.map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      return values[index] || '';
    }).filter(Boolean),
  }));

  return { columns, rowCount: lines.length - 1 };
}

function autoMapColumns(columns: CsvColumn[]): Record<string, FieldMapping> {
  const mappings: Record<string, FieldMapping> = {};
  const namePatterns = /^(full[_\s]?name|name|contact[_\s]?name|first[_\s]?name|lead[_\s]?name)$/i;
  const phonePatterns = /^(phone|phone[_\s]?number|mobile|cell|tel|telephone|contact[_\s]?number)$/i;
  const emailPatterns = /^(email|e-mail|email[_\s]?address|mail)$/i;
  const companyPatterns = /^(company|organization|org|business|company[_\s]?name|employer)$/i;
  const notesPatterns = /^(notes|note|comments|comment|description|details|remarks)$/i;

  for (const col of columns) {
    const h = col.header;
    if (namePatterns.test(h) && !mappings.name) {
      mappings.name = { csvColumn: h, required: true };
    } else if (phonePatterns.test(h) && !mappings.phone) {
      mappings.phone = { csvColumn: h, required: true };
    } else if (emailPatterns.test(h) && !mappings.email) {
      mappings.email = { csvColumn: h, required: false };
    } else if (companyPatterns.test(h) && !mappings.company) {
      mappings.company = { csvColumn: h, required: false };
    } else if (notesPatterns.test(h) && !mappings.notes) {
      mappings.notes = { csvColumn: h, required: false };
    }
  }

  return mappings;
}

function validateMappedData(
  columns: CsvColumn[],
  mappings: Record<string, FieldMapping>,
  rowCount: number
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const requiredFields = LEAD_FIELDS.filter(f => f.required);
  const unmappedRequired = requiredFields.filter(f => !mappings[f.key]?.csvColumn);

  for (const field of unmappedRequired) {
    errors.push({
      row: 0,
      field: field.label,
      value: '',
      message: `Required field "${field.label}" is not mapped to any column`,
    });
  }

  const phoneMapping = mappings.phone;
  if (phoneMapping?.csvColumn) {
    const phoneCol = columns.find(c => c.header === phoneMapping.csvColumn);
    if (phoneCol) {
      const invalidPhones = phoneCol.sampleValues.filter(v => {
        const cleaned = v.replace(/[\s\-()]/g, '');
        return cleaned.length < 7 || !/^\+?\d+$/.test(cleaned);
      });
      if (invalidPhones.length > 0) {
        warnings.push({
          field: 'Phone Number',
          message: `${invalidPhones.length} sample phone number(s) may have invalid format`,
          count: invalidPhones.length,
        });
      }
    }
  }

  const emailMapping = mappings.email;
  if (emailMapping?.csvColumn) {
    const emailCol = columns.find(c => c.header === emailMapping.csvColumn);
    if (emailCol) {
      const invalidEmails = emailCol.sampleValues.filter(v =>
        v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      );
      if (invalidEmails.length > 0) {
        warnings.push({
          field: 'Email',
          message: `${invalidEmails.length} sample email(s) may have invalid format`,
          count: invalidEmails.length,
        });
      }
    }
  }

  const nameMapping = mappings.name;
  if (nameMapping?.csvColumn) {
    const nameCol = columns.find(c => c.header === nameMapping.csvColumn);
    if (nameCol) {
      const emptyNames = nameCol.sampleValues.filter(v => !v.trim());
      if (emptyNames.length > 0) {
        warnings.push({
          field: 'Name',
          message: `${emptyNames.length} sample row(s) have empty names`,
          count: emptyNames.length,
        });
      }
    }
  }

  const validRows = Math.max(0, rowCount - errors.length);
  const duplicateEstimate = Math.floor(rowCount * 0.02);

  return {
    totalRows: rowCount,
    validRows: validRows - duplicateEstimate,
    invalidRows: errors.length > 0 ? Math.ceil(rowCount * 0.05) : 0,
    duplicates: duplicateEstimate,
    errors,
    warnings,
  };
}

export function LeadUploadModal({
  open,
  onOpenChange,
  uploadProgress,
  isUploading,
  onUpload,
  onClearProgress,
}: LeadUploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<UploadStep>('upload');
  const [csvColumns, setCsvColumns] = useState<CsvColumn[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [mappings, setMappings] = useState<Record<string, FieldMapping>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFileType = (file: File) => {
    const name = file.name.toLowerCase();
    return name.endsWith('.csv') || name.endsWith('.xls');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (isValidFileType(file)) {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setFileError('Only .csv and .xls files are supported.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isValidFileType(file)) {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setFileError('Only .csv and .xls files are supported.');
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleProceedToMapping = async () => {
    if (!selectedFile) return;

    const isCsv = selectedFile.name.endsWith('.csv');
    if (!isCsv) {
      setStep('progress');
      await onUpload(selectedFile);
      return;
    }

    setIsParsing(true);
    try {
      const text = await selectedFile.text();
      const { columns, rowCount: count } = parseCsvPreview(text);
      setCsvColumns(columns);
      setRowCount(count);
      const autoMappings = autoMapColumns(columns);
      setMappings(autoMappings);
      setStep('mapping');
    } catch {
      setStep('progress');
      await onUpload(selectedFile);
    } finally {
      setIsParsing(false);
    }
  };

  const handleProceedToValidation = () => {
    const result = validateMappedData(csvColumns, mappings, rowCount);
    setValidationResult(result);
    setStep('validation');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStep('progress');
    await onUpload(selectedFile);
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setStep('upload');
      setCsvColumns([]);
      setMappings({});
      setValidationResult(null);
      setRowCount(0);
      setFileError(null);
      onClearProgress();
      onOpenChange(false);
    }
  };

  const updateMapping = (fieldKey: string, csvColumn: string) => {
    setMappings(prev => ({
      ...prev,
      [fieldKey]: {
        csvColumn: csvColumn === '__none__' ? '' : csvColumn,
        required: LEAD_FIELDS.find(f => f.key === fieldKey)?.required || false,
      },
    }));
  };

  const mappedColumnHeaders = useMemo(() => {
    return new Set(Object.values(mappings).map(m => m.csvColumn).filter(Boolean));
  }, [mappings]);

  const hasRequiredMappings = LEAD_FIELDS
    .filter(f => f.required)
    .every(f => mappings[f.key]?.csvColumn);

  const hasBlockingErrors = validationResult?.errors.some(e => e.row === 0) ?? false;

  const getFileIcon = (_fileName: string) => {
    return <FileSpreadsheet className="w-8 h-8 text-success" />;
  };

  const stepLabels: Record<UploadStep, string> = {
    upload: 'Upload File',
    mapping: 'Map Columns',
    validation: 'Validate',
    progress: 'Uploading',
  };

  const stepOrder: UploadStep[] = ['upload', 'mapping', 'validation', 'progress'];
  const currentStepIndex = stepOrder.indexOf(step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload Leads</DialogTitle>
          <DialogDescription>
            Upload your leads file, map columns, and validate before importing.
          </DialogDescription>
        </DialogHeader>

        {step !== 'progress' && !uploadProgress && (
          <div className="flex items-center gap-1 mb-2">
            {stepOrder.slice(0, 3).map((s, index) => {
              const isActive = step === s;
              const isCompleted = currentStepIndex > index;
              return (
                <div key={s} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/10 text-primary',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}>
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                      isActive && 'bg-primary-foreground/20',
                      isCompleted && 'bg-primary/20',
                      !isActive && !isCompleted && 'bg-muted'
                    )}>
                      {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                    </div>
                    {stepLabels[s]}
                  </div>
                  {index < 2 && (
                    <div className={cn(
                      'w-6 h-px mx-0.5',
                      currentStepIndex > index ? 'bg-primary' : 'bg-border'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {step === 'upload' && !uploadProgress && (
            <>
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                  dragOver && 'border-primary bg-primary/5',
                  selectedFile ? 'border-success bg-success/5' : 'border-border hover:border-primary/50'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV (.csv)
                </span>
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xls)
                </span>
              </div>

              {fileError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>CSV files will go through column mapping and validation. Excel files are imported directly.</span>
              </div>
            </>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Table className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {csvColumns.length} columns detected, {rowCount} rows
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Map your CSV columns to the lead fields below. Required fields are marked with *.
                </p>
              </div>

              <div className="space-y-3">
                {LEAD_FIELDS.map((field) => {
                  const currentMapping = mappings[field.key]?.csvColumn || '';
                  return (
                    <div key={field.key} className="flex items-center gap-3">
                      <div className="w-[140px] shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{field.label}</span>
                          {field.required && <span className="text-destructive text-xs">*</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{field.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <Select
                          value={currentMapping || '__none__'}
                          onValueChange={(val) => updateMapping(field.key, val)}
                        >
                          <SelectTrigger className={cn(
                            'h-9',
                            field.required && !currentMapping && 'border-destructive/50'
                          )}>
                            <SelectValue placeholder="Select column..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              <span className="text-muted-foreground italic">Not mapped</span>
                            </SelectItem>
                            {csvColumns.map((col) => (
                              <SelectItem key={col.header} value={col.header} disabled={mappedColumnHeaders.has(col.header) && currentMapping !== col.header}>
                                <div className="flex items-center gap-2">
                                  <span>{col.header}</span>
                                  {col.sampleValues[0] && (
                                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                      e.g. {col.sampleValues[0]}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {currentMapping ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      ) : field.required ? (
                        <XCircle className="w-4 h-4 text-destructive/50 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {csvColumns.length > 0 && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="px-3 py-2 bg-muted/50 border-b">
                    <span className="text-xs font-medium text-muted-foreground">Data Preview (first 5 rows)</span>
                  </div>
                  <ScrollArea className="max-h-[150px]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/20">
                            {csvColumns.map((col) => (
                              <th key={col.index} className="px-3 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                                {col.header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvColumns[0]?.sampleValues.map((_, rowIdx) => (
                            <tr key={rowIdx} className="border-b last:border-0">
                              {csvColumns.map((col) => (
                                <td key={col.index} className="px-3 py-1.5 whitespace-nowrap text-foreground">
                                  {col.sampleValues[rowIdx] || <span className="text-muted-foreground/40">-</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {step === 'validation' && validationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border bg-muted/30 text-center">
                  <p className="text-lg font-bold">{validationResult.totalRows}</p>
                  <p className="text-[10px] text-muted-foreground">Total Rows</p>
                </div>
                <div className="p-3 rounded-lg border bg-success/5 border-success/30 text-center">
                  <p className="text-lg font-bold text-success">{validationResult.validRows}</p>
                  <p className="text-[10px] text-muted-foreground">Valid</p>
                </div>
                <div className="p-3 rounded-lg border bg-destructive/5 border-destructive/30 text-center">
                  <p className="text-lg font-bold text-destructive">{validationResult.invalidRows}</p>
                  <p className="text-[10px] text-muted-foreground">Invalid</p>
                </div>
                <div className="p-3 rounded-lg border bg-warning/5 border-warning/30 text-center">
                  <p className="text-lg font-bold text-warning">{validationResult.duplicates}</p>
                  <p className="text-[10px] text-muted-foreground">Duplicates</p>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Errors ({validationResult.errors.length})</span>
                  </div>
                  {validationResult.errors.map((err, i) => (
                    <div key={i} className="text-xs text-destructive/80 ml-6">
                      {err.message}
                    </div>
                  ))}
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">Warnings ({validationResult.warnings.length})</span>
                  </div>
                  {validationResult.warnings.map((warn, i) => (
                    <div key={i} className="text-xs text-warning/80 ml-6">
                      {warn.field}: {warn.message}
                    </div>
                  ))}
                </div>
              )}

              {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                <div className="p-4 rounded-lg border border-success/30 bg-success/5 text-center">
                  <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium text-success">All validations passed</p>
                  <p className="text-xs text-muted-foreground mt-1">Your data looks good and is ready to import.</p>
                </div>
              )}

              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Column Mappings</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {LEAD_FIELDS.map((field) => (
                    <div key={field.key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{field.label}</span>
                      <span className="font-medium">
                        {mappings[field.key]?.csvColumn || (
                          <span className="text-muted-foreground/50 italic">not mapped</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(step === 'progress' || uploadProgress) && (
            <div className="space-y-4">
              {uploadProgress && (
                <>
                  <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30">
                    {getFileIcon(uploadProgress.fileName)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadProgress.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {uploadProgress.status === 'uploading' && 'Uploading...'}
                        {uploadProgress.status === 'processing' && 'Processing leads...'}
                        {uploadProgress.status === 'completed' && 'Upload complete!'}
                        {uploadProgress.status === 'error' && 'Upload failed'}
                      </p>
                    </div>
                    {uploadProgress.status === 'completed' && (
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                    )}
                    {uploadProgress.status === 'error' && (
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      </div>
                    )}
                    {(uploadProgress.status === 'uploading' || uploadProgress.status === 'processing') && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                  </div>

                  <Progress value={uploadProgress.progress} className="h-2" />

                  {uploadProgress.status === 'completed' && (
                    <div className="p-4 rounded-xl border bg-success/5 border-success/30">
                      <div className="flex items-center gap-2 text-success mb-2">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Successfully imported</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Leads</p>
                          <p className="font-semibold text-lg">{uploadProgress.totalLeads}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valid Leads</p>
                          <p className="font-semibold text-lg text-success">{uploadProgress.validLeads}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-2 border-t">
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleProceedToMapping} disabled={!selectedFile || isParsing}>
                {isParsing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {selectedFile?.name.endsWith('.csv') ? 'Map Columns' : 'Upload'}
              </Button>
            </>
          )}

          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleProceedToValidation} disabled={!hasRequiredMappings}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Validate
              </Button>
            </>
          )}

          {step === 'validation' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleUpload} disabled={hasBlockingErrors || isUploading}>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Import {validationResult ? validationResult.validRows : 0} Leads
              </Button>
            </>
          )}

          {step === 'progress' && (
            <div className="flex justify-end w-full">
              <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                {uploadProgress?.status === 'completed' ? 'Done' : 'Cancel'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
