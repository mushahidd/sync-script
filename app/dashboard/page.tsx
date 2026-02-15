"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search, FolderOpen, Users, FileText, Clock, LogOut, Loader2, ChevronDown, LayoutGrid, List, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Sidebar } from "@/components/dashboard/sidebar";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface Vault {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  _count: {
    sources: number;
    members: number;
    fileUploads: number;
  };
  members: Array<{
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVaultTitle, setNewVaultTitle] = useState("");
  const [newVaultDescription, setNewVaultDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterMode, setFilterMode] = useState<"all" | "owner" | "shared">("all");
  const [sortMode, setSortMode] = useState<"recent" | "name" | "members">("recent");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch user's vaults
  useEffect(() => {
    const fetchVaults = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/vaults?userId=${session.user.id}`);
        const data = await response.json();
        setVaults(data);
      } catch (error) {
        console.error("Error fetching vaults:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchVaults();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleCreateVault = async () => {
    if (!newVaultTitle.trim() || !session?.user?.id) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newVaultTitle,
          description: newVaultDescription,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        // Refresh vaults list to get the new vault with counts
        const vaultsResponse = await fetch(`/api/vaults?userId=${session.user.id}`);
        const updatedVaults = await vaultsResponse.json();
        setVaults(updatedVaults);
        setIsModalOpen(false);
        setNewVaultTitle("");
        setNewVaultDescription("");
      }
    } catch (error) {
      console.error("Error creating vault:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const getUserRole = (vault: Vault) => {
    if (!session?.user?.id) return "VIEWER";
    const membership = vault.members.find((m) => m.user.id === session.user.id);
    return membership?.role || "VIEWER";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "CONTRIBUTOR":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "VIEWER":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const filteredVaults = vaults
    .filter((vault) => {
      // Search filter
      const matchesSearch = vault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vault.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Role filter
      if (filterMode === "all") return matchesSearch;
      const userRole = getUserRole(vault);
      if (filterMode === "owner") return matchesSearch && userRole === "OWNER";
      if (filterMode === "shared") return matchesSearch && userRole !== "OWNER";
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortMode === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortMode === "name") {
        return a.title.localeCompare(b.title);
      } else if (sortMode === "members") {
        return b._count.members - a._count.members;
      }
      return 0;
    });

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950 noise-bg items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 noise-bg">
      <Sidebar />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Compact Header with User Menu */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 mt-16 lg:mt-0"
        >
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 gradient-text">Research Vaults</h1>
                <p className="text-sm text-slate-400">Manage your collaborative knowledge bases</p>
              </div>
              {/* User Dropdown - Desktop Only */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-primary/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b border-slate-700">
                      <p className="font-medium">{session?.user?.name}</p>
                      <p className="text-sm text-slate-400 truncate">{session?.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Create Vault Button - Full width on mobile */}
            <Button size="lg" className="w-full sm:w-auto sm:self-start group" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create New Vault
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search vaults..." 
                className="pl-12 bg-slate-900/50 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Filter Controls - Horizontal Scroll on Mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-slate-700">
              {/* Filter Dropdown */}
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="flex-shrink-0 px-3 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-sm focus:outline-none focus:border-primary/50 transition-colors min-w-[100px]"
              >
                <option value="all">All Vaults</option>
                <option value="owner">My Vaults</option>
                <option value="shared">Shared</option>
              </select>
              {/* Sort Dropdown */}
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
                className="flex-shrink-0 px-3 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-sm focus:outline-none focus:border-primary/50 transition-colors min-w-[90px]"
              >
                <option value="recent">Recent</option>
                <option value="name">Name</option>
                <option value="members">Members</option>
              </select>
              {/* View Toggle */}
              <div className="flex-shrink-0 flex border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "bg-slate-900/50 text-slate-400 hover:text-white"}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-primary text-white" : "bg-slate-900/50 text-slate-400 hover:text-white"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {[
            { icon: FolderOpen, label: "Total Vaults", value: vaults.length.toString(), color: "text-cyan-400", gradient: "from-cyan-500/10 to-blue-500/10", border: "border-cyan-500/20" },
            { icon: FileText, label: "Total Sources", value: vaults.reduce((sum, v) => sum + v._count.sources, 0).toString(), color: "text-blue-400", gradient: "from-blue-500/10 to-indigo-500/10", border: "border-blue-500/20" },
            { icon: Users, label: "Total Members", value: vaults.reduce((sum, v) => sum + v._count.members, 0).toString(), color: "text-purple-400", gradient: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/20" },
            { icon: FileText, label: "PDFs Uploaded", value: vaults.reduce((sum, v) => sum + v._count.fileUploads, 0).toString(), color: "text-green-400", gradient: "from-green-500/10 to-emerald-500/10", border: "border-green-500/20" }
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

        {/* Vaults Grid/List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" : "space-y-4"}
        >
          {filteredVaults.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                {searchQuery ? "No vaults found matching your search" : "No vaults yet. Create your first vault to get started!"}
              </p>
            </div>
          ) : (
            filteredVaults.map((vault) => {
              const userRole = getUserRole(vault);
              const vaultColors = [
                "from-cyan-500 to-blue-500",
                "from-green-500 to-emerald-500",
                "from-purple-500 to-pink-500",
                "from-orange-500 to-red-500",
                "from-yellow-500 to-orange-500",
                "from-indigo-500 to-purple-500"
              ];
              const vaultColor = vaultColors[parseInt(vault.id.slice(-1), 16) % vaultColors.length];

              return (
                <motion.div key={vault.id} variants={item}>
                  <Link href={`/vaults/${vault.id}`}>
                    <Card hover className={`h-full group cursor-pointer ${viewMode === "list" ? "flex" : ""}`}>
                      <CardHeader className={viewMode === "list" ? "flex-1" : ""}>
                        <div className={`flex ${viewMode === "list" ? "flex-row" : "flex-col"} items-start justify-between mb-4`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vaultColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <FolderOpen className="w-6 h-6 text-white" />
                            </div>
                            {viewMode === "list" && (
                              <div>
                                <CardTitle className="group-hover:text-primary transition-colors mb-1">
                                  {vault.title}
                                </CardTitle>
                                <CardDescription>{vault.description || "No description"}</CardDescription>
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(userRole)}`}>
                            {userRole}
                          </span>
                        </div>
                        {viewMode === "grid" && (
                          <>
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {vault.title}
                            </CardTitle>
                            <CardDescription>{vault.description || "No description"}</CardDescription>
                          </>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center text-slate-400">
                            <FileText className="w-4 h-4 mr-1" />
                            {vault._count.sources} sources
                          </div>
                          <div className="flex items-center text-slate-400">
                            <Users className="w-4 h-4 mr-1" />
                            {vault._count.members} members
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-slate-400">
                            <FileText className="w-4 h-4 mr-1" />
                            {vault._count.fileUploads} PDFs
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(vault.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </main>

      {/* Create Vault Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Vault">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Vault Title</label>
            <Input
              placeholder="e.g., Machine Learning Research"
              value={newVaultTitle}
              onChange={(e) => setNewVaultTitle(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <Textarea
              placeholder="What is this vault about?"
              value={newVaultDescription}
              onChange={(e) => setNewVaultDescription(e.target.value)}
              disabled={isCreating}
              rows={4}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateVault}
              disabled={!newVaultTitle.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Vault
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
