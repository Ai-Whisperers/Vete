'use client';

import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Image,
  File,
  Download,
  Trash2,
  Eye,
  Calendar,
  FolderOpen,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileImage,
  FileSpreadsheet,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  category: 'medical' | 'lab' | 'xray' | 'vaccine' | 'prescription' | 'other';
  description?: string;
  uploaded_by?: string;
  created_at: string;
}

interface PetDocumentsTabProps {
  petId: string;
  petName: string;
  documents: Document[];
  clinic: string;
  onUpload?: (files: File[], category: string) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
}

type CategoryFilter = 'all' | Document['category'];

const categoryConfig: Record<Document['category'], { label: string; icon: React.ElementType; color: string }> = {
  medical: { label: 'Historial Médico', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  lab: { label: 'Laboratorio', icon: FileSpreadsheet, color: 'bg-purple-100 text-purple-700' },
  xray: { label: 'Rayos X / Imágenes', icon: FileImage, color: 'bg-green-100 text-green-700' },
  vaccine: { label: 'Vacunas', icon: FileText, color: 'bg-amber-100 text-amber-700' },
  prescription: { label: 'Recetas', icon: FileText, color: 'bg-pink-100 text-pink-700' },
  other: { label: 'Otros', icon: File, color: 'bg-gray-100 text-gray-700' },
};

export function PetDocumentsTab({
  petId,
  petName,
  documents,
  clinic,
  onUpload,
  onDelete,
}: PetDocumentsTabProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Document['category']>('other');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocuments = filter === 'all'
    ? documents
    : documents.filter(doc => doc.category === filter);

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
    return File;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
      setShowUploadModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      setShowUploadModal(true);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!onUpload || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFiles, uploadCategory);
      setSelectedFiles([]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!onDelete) return;
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      await onDelete(documentId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Documentos de {petName}
          </h2>
          <p className="text-sm text-gray-500">
            {documents.length} documento{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedFiles([]);
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-md"
        >
          <Upload className="w-4 h-4" />
          Subir Documento
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {(Object.keys(categoryConfig) as Document['category'][]).map(cat => {
          const config = categoryConfig[cat];
          const count = documents.filter(d => d.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                filter === cat
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === cat ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Upload className={`w-6 h-6 ${dragActive ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
        </div>
        <p className="text-sm text-gray-600 mb-1">
          Arrastra archivos aquí o{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[var(--primary)] font-medium hover:underline"
          >
            selecciona
          </button>
        </p>
        <p className="text-xs text-gray-400">
          PDF, imágenes, documentos • Máx 10MB por archivo
        </p>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => {
            const config = categoryConfig[doc.category];
            const FileIcon = getFileIcon(doc.file_type);
            const isImage = doc.file_type.startsWith('image/');

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Preview */}
                <div className="h-32 bg-gray-50 flex items-center justify-center relative">
                  {isImage ? (
                    <img
                      src={doc.file_url}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon className="w-12 h-12 text-gray-300" />
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </a>
                    <a
                      href={doc.file_url}
                      download={doc.name}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </a>
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.color} mb-2`}>
                    <config.icon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(doc.created_at)}
                    </span>
                    {doc.file_size && (
                      <span>• {formatFileSize(doc.file_size)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">
            {filter !== 'all' ? 'Sin documentos en esta categoría' : 'Sin documentos'}
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
            {filter !== 'all'
              ? 'No hay documentos de este tipo'
              : `Sube documentos de ${petName}: radiografías, análisis, recetas, etc.`}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-[var(--primary)] font-medium text-sm hover:underline"
            >
              Ver todos los documentos
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Subir Documentos</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* Category selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as Document['category'])}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 outline-none"
                >
                  {(Object.keys(categoryConfig) as Document['category'][]).map(cat => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected files */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivos seleccionados
                </label>
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-gray-300 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-500">Agregar archivos</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
