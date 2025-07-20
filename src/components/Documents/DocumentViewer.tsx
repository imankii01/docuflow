import React, { useState, useEffect } from 'react';
import { getDocument, getDocumentVersions, getComments, getActivityLog } from '../../lib/documents';
import { ArrowLeft, Upload, MessageCircle, CheckCircle, Clock, Download, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VersionHistory from './VersionHistory';
import CommentsPanel from './CommentsPanel';
import ActivityPanel from './ActivityPanel';
import UploadVersionModal from './UploadVersionModal';

interface Document {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  document_versions: Array<{
    id: string;
    version_number: number;
    file_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
    notes: string | null;
    uploaded_by: string;
  }>;
}

interface DocumentViewerProps {
  documentId: string;
  onBack: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, onBack }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<'versions' | 'comments' | 'activity'>('versions');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    setLoading(true);
    const { data, error } = await getDocument(documentId);
    if (!error && data) {
      setDocument(data as Document);
    }
    setLoading(false);
  };

  const handleVersionUploaded = () => {
    setShowUploadModal(false);
    loadDocument();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Document not found</p>
      </div>
    );
  }

  const latestVersion = document.document_versions[0];
  const tabs = [
    { id: 'versions', label: 'Versions', icon: Clock },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'activity', label: 'Activity', icon: CheckCircle },
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Documents
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{document.title}</h1>
              {document.description && (
                <p className="text-gray-600 text-lg mb-4 leading-relaxed">{document.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Created {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {document.document_versions.length} version{document.document_versions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="flex gap-3 ml-6">
              <button className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {latestVersion && (
                <a
                  href={`/api/download/${latestVersion.id}`}
                  className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              )}
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Version
              </button>
            </div>
          </div>

          {/* Current Version Info */}
          {latestVersion && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">Current Version: v{latestVersion.version_number}</h3>
                    <p className="text-blue-700 font-medium">{latestVersion.file_name}</p>
                    <p className="text-blue-600 text-sm mt-1">
                      {(latestVersion.file_size / 1024 / 1024).toFixed(2)} MB • 
                      Uploaded {formatDistanceToNow(new Date(latestVersion.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Latest
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[500px]">
          {activeTab === 'versions' && <VersionHistory documentId={documentId} />}
          {activeTab === 'comments' && <CommentsPanel documentId={documentId} />}
          {activeTab === 'activity' && <ActivityPanel documentId={documentId} />}
        </div>
      </div>

      {showUploadModal && (
        <UploadVersionModal
          documentId={documentId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleVersionUploaded}
        />
      )}
    </div>
  );
};

export default DocumentViewer;