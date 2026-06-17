import React from "react";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { useLocation, Link } from "react-router-dom";
import { Sun, Moon, User, LogOut } from "lucide-react";

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Home & Materi Belajar";
      case "/simulasi":
        return "Simulator Siklus Aset";
      case "/kuis":
        return "Kuis Interaktif";
      case "/about":
        return "Tentang CLICKASET";
      case "/signin":
        return "Masuk Ke Akun";
      case "/signup":
        return "Daftar Akun Baru";
      default:
        return "Dashboard";
    }
  };

  const userJson = localStorage.getItem("clickaset_user");
  const user = userJson ? JSON.parse(userJson) : null;

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white border-b border-stroke dark:border-stroke-dark dark:bg-boxdark-2 drop-shadow-1 dark:drop-shadow-none h-20 px-6 justify-between items-center text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar for Mobile */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 border border-stroke dark:border-stroke-dark rounded-md hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer"
        >
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Toggle Sidebar for Desktop */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 border border-stroke dark:border-stroke-dark rounded-md hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer"
        >
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Page Title */}
        <h1 className="font-heading font-semibold text-lg text-black dark:text-white ml-2">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 border border-stroke dark:border-stroke-dark rounded-full hover:bg-gray-100 dark:hover:bg-meta-4 text-gray-500 dark:text-gray-400 cursor-pointer"
          title={`Ganti ke mode ${theme === "dark" ? "terang" : "gelap"}`}
        >
          {theme === "dark" ? (
            <Sun className="w-4.5 h-4.5" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>

        {/* User Info */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-stroke dark:border-stroke-dark">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-black dark:text-white leading-none">{user.full_name}</p>
              <p className="text-[9px] text-[#3B919B] dark:text-[#68AEB8] uppercase tracking-wider font-bold mt-1">
                {user.role}
              </p>
            </div>
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#3B919B]/10 dark:bg-[#68AEB8]/10 text-[#3B919B] dark:text-[#68AEB8] font-bold text-xs border border-[#3B919B]/30 mr-1">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin keluar?")) {
                  localStorage.removeItem("clickaset_user");
                  window.location.href = "/";
                }
              }}
              className="p-2 border border-stroke dark:border-stroke-dark rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-600 transition duration-200 cursor-pointer"
              title="Logout / Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 border-l border-stroke dark:border-stroke-dark">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block">Tamu</span>
            <Link
              to="/signin"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-meta-4 border border-stroke dark:border-stroke-dark text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
