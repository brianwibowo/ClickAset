import React, { useState, useEffect } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { ThemeProvider } from "../context/ThemeContext";
import { Outlet, useNavigate } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { ShieldAlert, X, Loader2 } from "lucide-react";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const navigate = useNavigate();

  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Global loading states
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memproses data...");

  useEffect(() => {
    // 1. Listen to custom trigger event from any page for Auth Modal
    const handleShowModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      setModalMessage(customEvent.detail?.message || "Silakan login untuk mengakses fitur penuh.");
      setShowAuthModal(true);
    };

    // 2. Listen to custom trigger events for Global Loading
    const handleShowLoading = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLoadingMessage(customEvent.detail?.message || "Memproses data...");
      setGlobalLoading(true);
    };

    const handleHideLoading = () => {
      setGlobalLoading(false);
    };

    window.addEventListener("show-auth-modal", handleShowModal);
    window.addEventListener("show-global-loading", handleShowLoading);
    window.addEventListener("hide-global-loading", handleHideLoading);

    // 3. Global duration timer (45 seconds for guests)
    const userJson = localStorage.getItem("clickaset_user");
    const alreadyPrompted = sessionStorage.getItem("clickaset_auth_prompted");

    let timer: any = null;
    if (!userJson && !alreadyPrompted) {
      timer = setTimeout(() => {
        setModalMessage("Tertarik belajar akuntansi aset tetap lebih menyenangkan? Yuk, daftar akun CLICKASET gratis untuk membuka seluruh fitur!");
        setShowAuthModal(true);
        sessionStorage.setItem("clickaset_auth_prompted", "true");
      }, 45000); // 45 seconds trigger
    }

    return () => {
      window.removeEventListener("show-auth-modal", handleShowModal);
      window.removeEventListener("show-global-loading", handleShowLoading);
      window.removeEventListener("hide-global-loading", handleHideLoading);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>

      {/* Global Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white p-6 shadow-2xl dark:bg-gray-955 max-w-md w-full relative text-center space-y-4 text-gray-900 dark:text-white">
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                Buka Akses Penuh 🔒
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                {modalMessage}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/signup");
                }}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer"
              >
                Daftar Akun Gratis
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/signin");
                }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-850 dark:text-white text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 cursor-pointer"
              >
                Masuk ke Akun
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                Nanti Saja, Saya Ingin Browsing Dulu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Glassmorphism Loading Overlay */}
      {globalLoading && (
        <div className="fixed inset-0 z-999999 flex flex-col items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white/80 dark:bg-gray-955/80 border border-white/20 dark:border-gray-800 shadow-2xl text-center max-w-xs w-full">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-sm font-bold text-gray-850 dark:text-gray-200">
              {loadingMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default AppLayout;
