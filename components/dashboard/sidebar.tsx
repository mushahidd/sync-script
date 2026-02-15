"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, FolderOpen, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Overview", href: "/dashboard" },
  { icon: FolderOpen, label: "Vaults", href: "/dashboard" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
          <Image 
            src="/logo.png" 
            alt="SyncScript" 
            width={40} 
            height={40}
            className="object-contain"
          />
          <span className="font-bold text-xl">SyncScript</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            
            return (
              <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} title={item.label}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center flex-shrink-0">
            <span className="text-slate-950 font-bold text-xs">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
            <p className="text-xs text-slate-400 truncate">{session?.user?.email || ""}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass glass-border text-white"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 h-screen glass glass-border sticky top-0">
        <SidebarContent />
      </aside>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="lg:hidden w-64 h-screen glass glass-border flex flex-col fixed top-0 z-40"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
