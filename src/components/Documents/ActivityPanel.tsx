import React, { useState, useEffect } from 'react';
import { getActivityLog } from '../../lib/documents';
import { Activity, Clock, FileText, MessageCircle, Upload, Share, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogEntry {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
}

interface ActivityPanelProps {
  documentId: string;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ documentId }) => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [documentId]);

  const loadActivities = async () => {
    setLoading(true);
    const { data, error } = await getActivityLog(documentId);
    if (!error && data) {
      setActivities(data as ActivityLogEntry[]);
    }
    setLoading(false);
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'document_created':
        return FileText;
      case 'version_uploaded':
        return Upload;
      case 'comment_added':
        return MessageCircle;
      case 'document_shared':
        return Share;
      case 'approval_requested':
      case 'approval_updated':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  const getActivityMessage = (activity: ActivityLogEntry) => {
    const { action, details } = activity;
    
    switch (action) {
      case 'document_created':
        return `created the document "${details?.title}"`;
      case 'version_uploaded':
        return `uploaded version ${details?.version} (${details?.fileName})`;
      case 'comment_added':
        return `added a comment: "${details?.content}..."`;
      case 'document_shared':
        return `shared document with ${details?.permission} permission`;
      case 'approval_requested':
        return `requested approval`;
      case 'approval_updated':
        return `${details?.status} the approval`;
      default:
        return action.replace(/_/g, ' ');
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'document_created':
        return 'bg-green-100 text-green-600';
      case 'version_uploaded':
        return 'bg-blue-100 text-blue-600';
      case 'comment_added':
        return 'bg-purple-100 text-purple-600';
      case 'document_shared':
        return 'bg-orange-100 text-orange-600';
      case 'approval_requested':
        return 'bg-yellow-100 text-yellow-600';
      case 'approval_updated':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.action);
        const colorClass = getActivityColor(activity.action);
        
        return (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">User</span>
                <span className="text-sm text-gray-600">
                  {getActivityMessage(activity)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </div>
            {index < activities.length - 1 && (
              <div className="absolute left-4 mt-8 w-px h-6 bg-gray-200"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActivityPanel;