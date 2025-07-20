import React, { useState, useEffect } from 'react';
import { getDocumentVersions, downloadDocumentVersion } from '../../lib/documents';
import { Download, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DocumentVersion {
  id: string;
  version_number: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  notes: string | null;
  uploaded_by: string;
  file_path: string;
}

interface VersionHistoryProps {
  documentId: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ documentId }) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    setLoading(true);
    const { data, error } = await getDocumentVersions(documentId);
    if (!error && data) {
      setVersions(data as DocumentVersion[]);
    }
    setLoading(false);
  };

  const handleDownload = async (version: DocumentVersion) => {
    try {
      const { data, error } = await downloadDocumentVersion(version.file_path);
      if (error) {
        console.error('Download error:', error);
        return;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = version.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No versions uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version, index) => (
        <div
          key={version.id}
          className={`border rounded-lg p-4 ${
            index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                index === 0 ? 'bg-blue-200' : 'bg-gray-100'
              }`}>
                <FileText className={`w-5 h-5 ${
                  index === 0 ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">
                    Version {version.version_number}
                    {index === 0 && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Latest
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{version.file_name}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                  <span className="mx-2">•</span>
                  {formatFileSize(version.file_size)}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(version)}
              className="flex items-center px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          {version.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{version.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VersionHistory;