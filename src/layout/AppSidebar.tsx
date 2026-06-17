import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DocsIcon,
  PieChartIcon,
  ShootingStarIcon,
  InfoIcon,
  HorizontaLDots,
  UserCircleIcon
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  {
    icon: <DocsIcon />,
    name: "Home & Materi",
    path: "/",
  },
  {
    icon: <PieChartIcon />,
    name: "Simulasi Aset",
    path: "/simulasi",
  },
  {
    icon: <ShootingStarIcon />,
    name: "Kuis Interaktif",
    path: "/kuis",
  },
  {
    icon: <InfoIcon />,
    name: "Tentang Aplikasi",
    path: "/about",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  const showLabel = isExpanded || isHovered || isMobileOpen;

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => (
        <li key={nav.name}>
          <Link
            to={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`menu-item-icon-size ${
                isActive(nav.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              {nav.icon}
            </span>
            {showLabel && (
              <span className="menu-item-text">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          showLabel
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Logo Header */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/logo/logo-icon.svg"
            alt="Logo"
            width={32}
            height={32}
          />
          {showLabel && (
            <span className="font-bold text-xl tracking-wide text-gray-900 dark:text-white font-heading">
              CLICKASET
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {showLabel ? (
                  "Menu Utama"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>

      {/* Account Info / Footer */}
      <div className="py-6 border-t border-gray-200 dark:border-gray-800">
        <Link
          to="/signin"
          className={`menu-item group ${
            isActive("/signin") ? "menu-item-active" : "menu-item-inactive"
          }`}
        >
          <span className="menu-item-icon-size">
            <UserCircleIcon />
          </span>
          {showLabel && <span className="menu-item-text">Masuk / Daftar</span>}
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;
