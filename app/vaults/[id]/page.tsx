"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Plus, FileText, Users, MessageSquare, Link as LinkIcon, Calendar, ExternalLink, Upload, Loader2, Trash2, Wifi, Search, MoreVertical, TrendingUp, UserPlus, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { subscribeToChannel } from "@/lib/pusher-client";

interface VaultData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  sources: Array<{
    id: string;
    title: string;
    url: string;
    citation?: string;
    createdAt: string;
  }>;
  fileUploads: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    publicId: string | null;
    createdAt: string;
    uploader: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  annotations: Array<{
    id: string;
    content: string;
    pageNumber: number | null;
    createdAt: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function VaultDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract vault ID from params early
  const vaultId = params.id;
  
  // Collaborator modal state
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorRole, setCollaboratorRole] = useState("VIEWER");
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  
  // Annotation modal state
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [annotationContent, setAnnotationContent] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

  // Source modal state
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isAddingSource, setIsAddingSource] = useState(false);

  // Citation generation state
  const [isGeneratingCitation, setIsGeneratingCitation] = useState(false);
  const [citationError, setCitationError] = useState<string | null>(null);
  const [citationSuccess, setCitationSuccess] = useState<string | null>(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false,
  });

  // Real-time sync state
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dropdown menu state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // Citation copy state
  const [copiedCitations, setCopiedCitations] = useState<Set<string>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch vault data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchVaultData();
    }
  }, [status, session?.user?.id, vaultId]);

  // Real-time sync with Pusher
  useEffect(() => {
    if (!vaultId) return;

    // Subscribe to vault channel for real-time updates
    const unsubscribe = subscribeToChannel(
      `vault-${vaultId}`,
      'source-added',
      (data: any) => {
        console.log('[Real-time] New source added:', data);
        
        // Add new source to the list with animation
        setVaultData((prevData) => {
          if (!prevData) return prevData;
          
          return {
            ...prevData,
            sources: [...prevData.sources, data.source],
          };
        });

        // Show notification (optional)
        setUploadSuccess('New source added by collaborator!');
        setTimeout(() => setUploadSuccess(null), 3000);
      }
    );

    // Also subscribe to citation generation events
    const citationUnsubscribe = subscribeToChannel(
      `vault-${vaultId}`,
      'citation-generated',
      (data: any) => {
        console.log('[Real-time] Citation generated:', data);
        
        // Add new source with citation to the list
        setVaultData((prevData) => {
          if (!prevData) return prevData;
          
          return {
            ...prevData,
            sources: [...prevData.sources, data.source],
          };
        });

        // Show notification
        setCitationSuccess(`New PDF with citation added by ${data.addedBy === userId ? 'you' : 'collaborator'}!`);
        setTimeout(() => setCitationSuccess(null), 3000);
      }
    );

    // Mark sync as active
    setIsLiveSyncActive(true);

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      citationUnsubscribe();
      setIsLiveSyncActive(false);
    };
  }, [vaultId]);

  // Derived state - user permissions
  const userId = session?.user?.id || '';
  const currentUserMember = vaultData?.members?.find(m => m.user.id === userId);
  const userRole = currentUserMember?.role || 'VIEWER';
  
  const isOwner = userRole === 'OWNER';
  const isContributor = userRole === 'CONTRIBUTOR';
  const isViewer = userRole === 'VIEWER';
  const canUpload = isOwner || isContributor;
  const canAddSource = isOwner || isContributor;
  const canAddAnnotation = isOwner || isContributor;
  const canDeletePDF = isOwner;
  const canDeleteSource = isOwner;
  const canDeleteAnyAnnotation = isOwner;
  
  const canDeleteAnnotation = (authorId: string) => {
    return isOwner || (isContributor && authorId === userId);
  };

  const tabs = [
    { id: "sources", label: "Sources", icon: <FileText className="w-4 h-4" /> },
    { id: "pdfs", label: "PDFs", icon: <LinkIcon className="w-4 h-4" /> },
    { id: "annotations", label: "Annotations", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "collaborators", label: "Collaborators", icon: <Users className="w-4 h-4" /> }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset messages
    setUploadError(null);
    setUploadSuccess(null);

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vaultId', vaultId);
      formData.append('uploadedBy', userId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Refresh vault data to show the new file
      await fetchVaultData();
      setUploadSuccess(`${file.name} uploaded successfully!`);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePDFUploadWithCitation = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset messages
    setCitationError(null);
    setCitationSuccess(null);

    // Validate file type
    if (file.type !== 'application/pdf') {
      setCitationError('Only PDF files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setCitationError('File size must be less than 10MB');
      return;
    }

    setIsGeneratingCitation(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vaultId', vaultId);
      formData.append('userId', userId);

      const response = await fetch('/api/generate-citation', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Citation generation failed');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Citation generation failed');
      }

      // Refresh vault data to show the new source with citation
      await fetchVaultData();
      if (!data.aiGenerated && data.aiError) {
        setCitationError(`AI unavailable: ${data.aiError}`);
      }

      setCitationSuccess(
        `PDF processed successfully! ${
          data.aiGenerated 
            ? 'AI-powered citation generated.' 
            : 'Basic citation format applied.'
        }`
      );

      // Clear success message after 5 seconds
      setTimeout(() => setCitationSuccess(null), 5000);
    } catch (error) {
      console.error('Citation generation error:', error);
      setCitationError(error instanceof Error ? error.message : 'Failed to generate citation');
    } finally {
      setIsGeneratingCitation(false);
    }
  };

  const fetchVaultData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/vaults/${vaultId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vault');
      }

      const data = await response.json();
      setVaultData(data);
    } catch (error) {
      console.error('Error fetching vault:', error);
      // Optionally redirect to dashboard if vault not found
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!collaboratorEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsAddingCollaborator(true);

    try {
      const response = await fetch(`/api/vaults/${vaultId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: collaboratorEmail,
          role: collaboratorRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add collaborator');
      }

      // Refresh vault data
      await fetchVaultData();
      
      // Reset and close modal
      setCollaboratorEmail('');
      setCollaboratorRole('VIEWER');
      setIsCollaboratorModalOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add collaborator');
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  const handleAddSource = async () => {
    if (!sourceTitle.trim()) {
      alert('Please enter a source title');
      return;
    }

    if (!sourceUrl.trim()) {
      alert('Please enter a source URL');
      return;
    }

    setIsAddingSource(true);

    try {
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sourceTitle,
          url: sourceUrl,
          vaultId: vaultId,
          userId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add source');
      }

      // Refresh vault data
      await fetchVaultData();
      
      // Reset and close modal
      setSourceTitle('');
      setSourceUrl('');
      setIsModalOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add source');
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleAddAnnotation = async () => {
    if (!annotationContent.trim()) {
      alert('Please enter annotation content');
      return;
    }

    if (!selectedSourceId) {
      alert('Please select a source');
      return;
    }

    setIsAddingAnnotation(true);

    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: annotationContent,
          sourceId: selectedSourceId,
          authorId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add annotation');
      }

      // Refresh vault data
      await fetchVaultData();
      
      // Reset and close modal
      setAnnotationContent('');
      setSelectedSourceId(null);
      setIsAnnotationModalOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add annotation');
    } finally {
      setIsAddingAnnotation(false);
    }
  };

  const handleDeleteVault = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Vault",
      message: "Are you sure you want to delete this vault? This will permanently delete all sources, PDFs, annotations, and members. This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(`/api/vaults/${vaultId}?userId=${session?.user?.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete vault');
          }

          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to delete vault');
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleDeleteSource = async (sourceId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Source",
      message: "Delete this source? This will also delete all related annotations.",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(`/api/sources/${sourceId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete source');
          }

          await fetchVaultData();
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {}, isLoading: false });
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to delete source');
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleDeleteFile = async (fileId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete PDF",
      message: "Are you sure you want to delete this PDF?",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(`/api/uploads/${fileId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete file');
          }

          await fetchVaultData();
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {}, isLoading: false });
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to delete file');
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Annotation",
      message: "Are you sure you want to delete this annotation?",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(`/api/annotations/${annotationId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete annotation');
          }

          await fetchVaultData();
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {}, isLoading: false });
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to delete annotation');
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Member",
      message: "Are you sure you want to remove this member from the vault?",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(`/api/vaults/${vaultId}/members?memberId=${memberId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to remove member');
          }

          await fetchVaultData();
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {}, isLoading: false });
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to remove member');
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950 noise-bg items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 noise-bg">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-3 sm:mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{vaultData?.title || 'Loading...'}</h1>
                  {userRole && (
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                      userRole === 'OWNER' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : userRole === 'CONTRIBUTOR'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {userRole}
                    </span>
                  )}
                  {isLiveSyncActive && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"
                    >
                      <Wifi className="w-3 h-3" />
                      <span className="hidden sm:inline">Live Sync</span>
                    </motion.span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-slate-400 mb-3">{vaultData?.description || ''}</p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Created </span>{vaultData?.createdAt ? new Date(vaultData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Options Menu */}
                {isOwner && (
                  <div className="relative">
                    <Button 
                      size="lg" 
                      variant="ghost"
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      className="px-3"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                    {showOptionsMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowOptionsMenu(false);
                              handleDeleteVault();
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Vault
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Vault Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
            >
              {[
                { icon: FileText, label: "Sources", value: vaultData?.sources?.length || 0, color: "text-blue-400", gradient: "from-blue-500/10 to-indigo-500/10", border: "border-blue-500/20" },
                { icon: LinkIcon, label: "PDFs", value: vaultData?.fileUploads?.length || 0, color: "text-red-400", gradient: "from-red-500/10 to-pink-500/10", border: "border-red-500/20" },
                { icon: MessageSquare, label: "Annotations", value: vaultData?.annotations?.length || 0, color: "text-purple-400", gradient: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/20" },
                { icon: Users, label: "Members", value: vaultData?.members?.length || 0, color: "text-green-400", gradient: "from-green-500/10 to-emerald-500/10", border: "border-green-500/20" }
              ].map((stat, idx) => (
                <Card key={idx} className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} border ${stat.border} hover:scale-105 transition-transform cursor-pointer group`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400 mb-1 flex items-center gap-1">
                          {stat.label}
                          <TrendingUp className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Quick Actions Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              {canUpload && (
                <Button 
                  size="lg" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 group bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Upload PDF
                    </>
                  )}
                </Button>
              )}
              {canUpload && (
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('citation-pdf-upload')?.click()}
                  disabled={isGeneratingCitation}
                  className="flex-1 group bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400"
                >
                  {isGeneratingCitation ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Citation...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      PDF + Citation
                    </>
                  )}
                </Button>
              )}
              <Button 
                size="lg" 
                onClick={() => setIsCollaboratorModalOpen(true)}
                className="flex-1 group bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400"
              >
                <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Invite User
              </Button>
              {canAddSource && (
                <Button 
                  size="lg" 
                  onClick={() => setIsModalOpen(true)} 
                  className="flex-1 group bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Add Source
                </Button>
              )}
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  placeholder="Search sources, PDFs, annotations..." 
                  className="pl-12 bg-slate-900/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="pdf-upload-hidden"
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePDFUploadWithCitation}
            disabled={isGeneratingCitation}
            className="hidden"
            id="citation-pdf-upload"
          />

          {/* Upload Messages */}
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <p className="text-sm text-green-400">{uploadSuccess}</p>
            </motion.div>
          )}
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <p className="text-sm text-red-400">{uploadError}</p>
            </motion.div>
          )}
          
          {/* Citation Messages */}
          {citationSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <p className="text-sm text-blue-400">{citationSuccess}</p>
            </motion.div>
          )}
          {citationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg"
            >
              <p className="text-sm text-orange-400">{citationError}</p>
            </motion.div>
          )}

          {/* Tabs Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs tabs={tabs}>
              {(activeTab) => {
                if (activeTab === "sources") {
                  const filteredSources = vaultData?.sources?.filter(source =>
                    source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    source.url.toLowerCase().includes(searchQuery.toLowerCase())
                  ) || [];

                  return (
                    <div className="space-y-4">
                      {filteredSources.length > 0 ? (
                        filteredSources.map((source, idx) => (
                          <motion.div
                            key={source.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card hover>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg mb-2">{source.title}</CardTitle>
                                    <CardDescription className="mb-3">
                                      <a 
                                        href={source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-primary-light transition-colors text-sm flex items-center gap-1"
                                      >
                                        <LinkIcon className="w-3 h-3" />
                                        {source.url}
                                      </a>
                                    </CardDescription>
                                    
                                    {/* Citation Display */}
                                    {source.citation && (
                                      <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs font-medium text-blue-400">APA Citation</span>
                                          <button
                                            onClick={async () => {
                                              try {
                                                await navigator.clipboard.writeText(source.citation!);
                                                setCopiedCitations(prev => new Set([...prev, source.id]));
                                                setTimeout(() => {
                                                  setCopiedCitations(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete(source.id);
                                                    return newSet;
                                                  });
                                                }, 2000);
                                              } catch (err) {
                                                console.error('Failed to copy citation:', err);
                                              }
                                            }}
                                            className="text-slate-400 hover:text-blue-400 transition-colors p-1 rounded"
                                            title="Copy citation"
                                          >
                                            {copiedCitations.has(source.id) ? (
                                              <Check className="w-3 h-3" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                        <p className="text-sm text-slate-300 italic">{source.citation}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    {canDeleteSource && (
                                      <button
                                        onClick={() => handleDeleteSource(source.id)}
                                        className="text-slate-500 hover:text-red-400 transition-colors"
                                        title="Delete source"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">
                            {searchQuery ? "No sources found matching your search" : "No sources added yet"}
                          </p>
                          {!searchQuery && <p className="text-sm text-slate-500 mt-2">Click "Add Source" to get started</p>}
                        </div>
                      )}
                    </div>
                  );
                }

                if (activeTab === "pdfs") {
                  const filteredPDFs = vaultData?.fileUploads?.filter(pdf =>
                    pdf.fileName.toLowerCase().includes(searchQuery.toLowerCase())
                  ) || [];

                  return (
                    <div className="space-y-4">
                      {filteredPDFs.length > 0 ? (
                        filteredPDFs.map((pdf, idx) => {
                            const uploadDate = new Date(pdf.createdAt);
                            const now = new Date();
                            const diffInDays = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
                            const uploadedTime = diffInDays === 0 ? 'Today' : diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
                            
                            return (
                              <motion.div
                                key={pdf.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <Card hover>
                                  <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                          <FileText className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-1">{pdf.fileName}</h4>
                                          <p className="text-sm text-slate-400">Uploaded {uploadedTime} by {pdf.uploader.name}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {/* Open PDF Button - Uses API route with authentication */}
                                        <a
                                          href={`/api/pdf/${pdf.id}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Button variant="ghost" size="sm">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open PDF
                                          </Button>
                                        </a>
                                        
                                        {/* Download Button */}
                                        <a
                                          href={`/api/pdf/${pdf.id}`}
                                          download={pdf.fileName}
                                        >
                                          <Button variant="ghost" size="sm">
                                            Download
                                          </Button>
                                        </a>
                                        
                                        {canDeletePDF && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDeleteFile(pdf.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="text-center py-12">
                            <LinkIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">
                              {searchQuery ? "No PDFs found matching your search" : "No PDFs uploaded yet"}
                            </p>
                            {!searchQuery && canUpload && <p className="text-sm text-slate-500 mt-2">Use the "Upload PDF" button above to get started</p>}
                          </div>
                        )}
                    </div>
                  );
                }

                if (activeTab === "annotations") {
                  const filteredAnnotations = vaultData?.annotations?.filter(annotation =>
                    annotation.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    annotation.author.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ) || [];

                  return (
                    <div className="space-y-4">
                      {/* Add Annotation Button - only show if there are sources and user can add */}
                      {canAddAnnotation && vaultData?.sources && vaultData.sources.length > 0 && (
                        <Button 
                          onClick={() => setIsAnnotationModalOpen(true)}
                          className="mb-4"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Annotation
                        </Button>
                      )}

                      {filteredAnnotations.length > 0 ? (
                        filteredAnnotations.map((annotation, idx) => {
                          const annotationDate = new Date(annotation.createdAt);
                          const now = new Date();
                          const diffInHours = Math.floor((now.getTime() - annotationDate.getTime()) / (1000 * 60 * 60));
                          const timeAgo = diffInHours < 1 ? 'Just now' : diffInHours < 24 ? `${diffInHours} hours ago` : `${Math.floor(diffInHours / 24)} days ago`;
                          
                          return (
                            <motion.div
                              key={annotation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      {annotation.pageNumber && (
                                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                                          Page {annotation.pageNumber}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-slate-500">{timeAgo}</span>
                                      {canDeleteAnnotation(annotation.author.id) && (
                                        <button
                                          onClick={() => handleDeleteAnnotation(annotation.id)}
                                          className="text-slate-500 hover:text-red-400 transition-colors"
                                          title="Delete annotation"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-slate-300 mb-2">{annotation.content}</p>
                                  <p className="text-sm text-slate-500">by {annotation.author.name}</p>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">
                            {searchQuery ? "No annotations found matching your search" : "No annotations yet"}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                if (activeTab === "collaborators") {
                  const filteredMembers = vaultData?.members?.filter(member =>
                    member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
                  ) || [];

                  return (
                    <div className="space-y-4">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member, idx) => {
                          const avatar = member.user.name?.charAt(0).toUpperCase() || 'U';
                          
                          return (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                                        <span className="text-slate-950 font-bold text-sm">{avatar}</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-1">{member.user.name}</h4>
                                        <p className="text-sm text-slate-400">{member.user.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        member.role === 'OWNER' 
                                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                          : member.role === 'CONTRIBUTOR'
                                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                      }`}>
                                        {member.role}
                                      </span>
                                      {/* Only show remove button if current user is owner and target is not the current user */}
                                      {vaultData?.members?.some(m => m.user.id === session?.user?.id && m.role === 'OWNER') && 
                                       member.user.id !== session?.user?.id && (
                                        <button
                                          onClick={() => handleRemoveMember(member.id)}
                                          className="text-slate-500 hover:text-red-400 transition-colors"
                                          title="Remove member"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">
                            {searchQuery ? "No members found matching your search" : "No members"}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              }}
            </Tabs>
          </motion.div>

          {/* Add Source Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Source">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input 
                  placeholder="Research paper or article title" 
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <Input 
                  placeholder="https://..." 
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setSourceTitle('');
                    setSourceUrl('');
                  }}
                  disabled={isAddingSource}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddSource}
                  disabled={isAddingSource}
                >
                  {isAddingSource ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Source'
                  )}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Add Collaborator Modal */}
          <Modal 
            isOpen={isCollaboratorModalOpen} 
            onClose={() => setIsCollaboratorModalOpen(false)} 
            title="Add Collaborator"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input 
                  type="email"
                  placeholder="collaborator@example.com"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">User must be registered to be added</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={collaboratorRole}
                  onChange={(e) => setCollaboratorRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="VIEWER">Viewer - Can view sources and PDFs</option>
                  <option value="CONTRIBUTOR">Contributor - Can add sources and annotations</option>
                  <option value="OWNER">Owner - Full access and management</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsCollaboratorModalOpen(false)}
                  disabled={isAddingCollaborator}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCollaborator}
                  disabled={isAddingCollaborator}
                >
                  {isAddingCollaborator ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Collaborator'
                  )}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Add Annotation Modal */}
          <Modal 
            isOpen={isAnnotationModalOpen} 
            onClose={() => setIsAnnotationModalOpen(false)} 
            title="Add Annotation"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Source</label>
                <select
                  value={selectedSourceId || ''}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a source...</option>
                  {vaultData?.sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.title} ({source.author}, {source.year})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Annotation</label>
                <Textarea 
                  placeholder="Add your note, insight, or question..."
                  value={annotationContent}
                  onChange={(e) => setAnnotationContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAnnotationModalOpen(false)}
                  disabled={isAddingAnnotation}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddAnnotation}
                  disabled={isAddingAnnotation}
                >
                  {isAddingAnnotation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Annotation'
                  )}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Confirm Modal */}
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {}, isLoading: false })}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            isLoading={confirmModal.isLoading}
          />
        </div>
        </main>
      </div>
  );
}
