"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_CONFIG } from "@/lib/config";
import {
  TrendingUp,
  LayoutDashboard,
  FilePlus,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda", icon: null },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/analysis/new/planner", label: "Rencana Baru", icon: FilePlus },
    { href: "/analysis/new/growth", label: "Evaluasi Usaha", icon: TrendingUp },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <header className="bg-[#2c3e50] border-b-4 border-[#1abc9c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Flat Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded bg-[#1abc9c] flex items-center justify-center text-white font-bold shadow-flat">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-normal text-white block">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] text-[#1abc9c] font-semibold tracking-wider uppercase block -mt-1">
                Sistem Pendukung Keputusan
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#1abc9c] text-white"
                      : "text-[#bdc3c7] hover:text-white hover:bg-[#34495e]"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Demo Mode Flat Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f39c12] text-white text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Mode Demo Lokal</span>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-[#bdc3c7] hover:text-white hover:bg-[#34495e]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#34495e] bg-[#2c3e50] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded text-xs font-bold uppercase tracking-wider ${
                  isActive
                    ? "bg-[#1abc9c] text-white"
                    : "text-[#bdc3c7] hover:bg-[#34495e] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
