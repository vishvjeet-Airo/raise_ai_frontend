import { Link, useParams, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { ChevronRight, Clock, User, FileCheck, FileX, Download, Eye, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditEvent {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  userRole: string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    changes?: string[];
  };
}

export default function AuditTrail() {
  const { id } = useParams();
  const location = useLocation();
  const documentFromState = location.state?.document;

  // Mock audit data - in a real app this would come from an API
  const auditEvents: AuditEvent[] = [
    {
      id: "1",
      action: "Document Uploaded",
      timestamp: "2025-04-03T14:15:00Z",
      user: "John Smith",
      userRole: "Document Uploader",
      details: "Original document uploaded to the system",
      status: "success",
      metadata: {
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        location: "Mumbai, India"
      }
    },
    {
      id: "2",
      action: "AI Analysis Started",
      timestamp: "2025-04-03T14:16:30Z",
      user: "System AI",
      userRole: "Automated System",
      details: "AI processing initiated for content analysis and extraction",
      status: "info",
      metadata: {
        ipAddress: "System Internal",
        location: "Cloud Processing Center"
      }
    },
    {
      id: "3",
      action: "AI Analysis Completed",
      timestamp: "2025-04-03T14:20:45Z",
      user: "System AI",
      userRole: "Automated System",
      details: "Successfully extracted key obligations, compliance requirements, and action items",
      status: "success",
      metadata: {
        changes: ["Extracted 15 key obligations", "Identified 8 action items", "Generated compliance summary"]
      }
    },
    {
      id: "4",
      action: "Document Reviewed",
      timestamp: "2025-04-03T14:25:12Z",
      user: "Sarah Johnson",
      userRole: "Compliance Officer",
      details: "Initial review completed, flagged for senior verification",
      status: "warning",
      metadata: {
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        location: "Delhi, India",
        changes: ["Added review notes", "Flagged section 4.2 for attention"]
      }
    },
    {
      id: "5",
      action: "Sent for Verification",
      timestamp: "2025-04-03T14:27:33Z",
      user: "Sarah Johnson",
      userRole: "Compliance Officer",
      details: "Document sent to senior team for final verification and approval",
      status: "info",
      metadata: {
        ipAddress: "192.168.1.105",
        location: "Delhi, India"
      }
    },
    {
      id: "6",
      action: "Senior Verification",
      timestamp: "2025-04-03T15:45:20Z",
      user: "Michael Chen",
      userRole: "Senior Compliance Manager",
      details: "Verified AI analysis accuracy and compliance requirements",
      status: "success",
      metadata: {
        ipAddress: "192.168.1.110",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        location: "Bangalore, India",
        changes: ["Approved AI findings", "Added additional compliance notes", "Updated risk assessment"]
      }
    },
    {
      id: "7",
      action: "Document Escalated",
      timestamp: "2025-04-03T16:12:45Z",
      user: "Michael Chen",
      userRole: "Senior Compliance Manager",
      details: "Escalated to legal team due to complex regulatory implications",
      status: "warning",
      metadata: {
        ipAddress: "192.168.1.110",
        location: "Bangalore, India",
        changes: ["Escalation reason: Complex cross-border regulations"]
      }
    },
    {
      id: "8",
      action: "Export Generated",
      timestamp: "2025-04-03T16:30:15Z",
      user: "System",
      userRole: "Automated System",
      details: "Compliance report exported in PDF format",
      status: "success",
      metadata: {
        ipAddress: "System Internal"
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/documents" className="hover:text-gray-900 transition-colors font-poppins">
              All Documents
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link 
              to={`/documents/${id}`} 
              state={{ document: documentFromState }}
              className="hover:text-gray-900 transition-colors font-poppins"
            >
              {documentFromState?.name || 'Document Detail'}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1F4A75] font-semibold font-poppins">
              Audit Trail & Full History
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2 font-poppins">
              Document Audit Trail & Full History
            </h1>
            <p className="text-gray-600 font-poppins">
              Complete chronological record of all activities and changes for "{documentFromState?.name || 'Document'}"
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900 font-poppins">
                  {auditEvents.length}
                </div>
                <div className="text-sm text-gray-500 font-poppins">
                  Total Events
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600 font-poppins">
                  {auditEvents.filter(e => e.status === 'success').length}
                </div>
                <div className="text-sm text-gray-500 font-poppins">
                  Successful Actions
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600 font-poppins">
                  {auditEvents.filter(e => e.status === 'warning').length}
                </div>
                <div className="text-sm text-gray-500 font-poppins">
                  Warnings
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600 font-poppins">
                  {new Set(auditEvents.map(e => e.user)).size}
                </div>
                <div className="text-sm text-gray-500 font-poppins">
                  Unique Users
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 font-poppins">
                Complete Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
                
                {auditEvents.map((event, index) => {
                  const { date, time } = formatTimestamp(event.timestamp);
                  
                  return (
                    <div key={event.id} className="relative flex pb-8 last:pb-0">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex-shrink-0">
                        {getStatusIcon(event.status)}
                      </div>
                      
                      {/* Content */}
                      <div className="ml-6 flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 font-poppins">
                                {event.action}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 font-poppins">
                                {event.details}
                              </p>
                            </div>
                            <Badge className={`ml-4 ${getStatusColor(event.status)}`}>
                              {event.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span className="font-poppins">{event.user}</span>
                                <span className="text-gray-400">({event.userRole})</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-poppins">{date} at {time}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Metadata */}
                          {event.metadata && (
                            <div className="bg-gray-50 rounded p-3 text-xs">
                              <div className="grid grid-cols-2 gap-3 text-gray-600">
                                {event.metadata.ipAddress && (
                                  <div>
                                    <span className="font-medium">IP Address:</span> {event.metadata.ipAddress}
                                  </div>
                                )}
                                {event.metadata.location && (
                                  <div>
                                    <span className="font-medium">Location:</span> {event.metadata.location}
                                  </div>
                                )}
                                {event.metadata.userAgent && (
                                  <div className="col-span-2">
                                    <span className="font-medium">User Agent:</span> {event.metadata.userAgent}
                                  </div>
                                )}
                                {event.metadata.changes && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Changes:</span>
                                    <ul className="list-disc list-inside ml-2 mt-1">
                                      {event.metadata.changes.map((change, i) => (
                                        <li key={i}>{change}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8">
            <Button variant="outline" className="font-poppins">
              <Download className="w-4 h-4 mr-2" />
              Export Audit Log
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.print()}
              className="font-poppins"
            >
              <Eye className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
