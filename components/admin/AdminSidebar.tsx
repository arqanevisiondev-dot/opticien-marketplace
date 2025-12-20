'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FolderTree,
  Settings,
  Mail,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  UserCheck,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Gift,
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  badge?: number;
  children?: {
    title: string;
    href: string;
    icon: React.ElementType;
  }[];
}

export default function AdminSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([t.products, t.opticians, t.loyalty]);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = [
    {
      title: t.dashboard,
      icon: LayoutDashboard,
      href: '/admin',
    },
    {
      title: t.products,
      icon: Package,
      children: [
        { title: t.allProducts, href: '/admin/products', icon: List },
        { title: t.addProduct, href: '/admin/products/new', icon: Plus },
        { title: t.editProducts, href: '/admin/products?tab=edit', icon: Settings },
        { title: t.categories, href: '/admin/categories', icon: FolderTree },
      ],
    },
    {
      title: t.loyalty,
      icon: Gift,
      children: [
        { title: t.loyaltyCatalog, href: '/admin/loyalty-products', icon: List },
        { title: t.newProduct, href: '/admin/loyalty-products/new', icon: Plus },
      ],
    },
    {
      title: t.opticians,
      icon: Users,
      children: [
        { title: t.allOpticians, href: '/admin/opticians', icon: List },
        { title: t.pending, href: '/admin/opticians?status=pending', icon: UserCheck },
        { title: t.approved, href: '/admin/opticians?status=approved', icon: UserPlus },
      ],
    },
    {
      title: t.orders,
      icon: ShoppingCart,
      href: '/admin/orders',
    },
    {
      title: t.campaigns,
      icon: Mail,
      children: [
        { title: t.allCampaigns, href: '/admin/campaigns', icon: List },
      ],
    },
    {
      title: t.settings,
      icon: Settings,
      children: [
        { title: t.productOptions, href: '/admin/settings', icon: Settings },
        { title: t.sliderManagement, href: '/admin/slider', icon: Package },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === href;
    
    // Parse href to get path and query params
    const [hrefPath, hrefQuery] = href.split('?');
    const currentQuery = searchParams.toString();
    
    // Check for exact match with query params
    if (hrefQuery) {
      return pathname === hrefPath && currentQuery === hrefQuery;
    }
    
    // For paths without query params, only match if current URL also has no query params
    return pathname === hrefPath && currentQuery === '';
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-palladian transition-colors"
      >
        {isOpen ? <X className="w-6 h-6 text-abyssal" /> : <Menu className="w-6 h-6 text-abyssal" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen lg:h-auto bg-abyssal text-white transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-fantastic/30 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'hidden' : ''}`}>
            <div className="w-10 h-10 bg-burning-flame rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Arqane Vision</h1>
              <p className="text-xs text-oatmeal">{t.adminPanel}</p>
            </div>
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 hover:bg-blue-fantastic/20 rounded-lg transition-colors"
            title={isCollapsed ? t.expandSidebar : t.collapseSidebar}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-oatmeal" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-oatmeal" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg hover:bg-blue-fantastic/20 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-burning-flame`}
                    title={isCollapsed ? item.title : ''}
                  >
                    <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                      <item.icon className="w-5 h-5 text-oatmeal group-hover:text-burning-flame transition-colors" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </div>
                    {!isCollapsed && (
                      expandedMenus.includes(item.title) ? (
                        <ChevronDown className="w-4 h-4 text-oatmeal" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-oatmeal" />
                      )
                    )}
                  </button>
                  
                  {!isCollapsed && expandedMenus.includes(item.title) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={(e) => {
                            e.currentTarget.blur();
                          }}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-burning-flame ${
                            isActive(child.href)
                              ? 'bg-burning-flame text-white'
                              : 'hover:bg-blue-fantastic/20 text-palladian'
                          }`}
                        >
                          <child.icon className="w-4 h-4" />
                          <span className="text-sm">{child.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  onClick={(e) => {
                    e.currentTarget.blur();
                  }}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-burning-flame ${
                    isActive(item.href!)
                      ? 'bg-burning-flame text-white shadow-lg'
                      : 'hover:bg-blue-fantastic/20 text-palladian'
                  }`}
                  title={isCollapsed ? item.title : ''}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto bg-burning-flame text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
