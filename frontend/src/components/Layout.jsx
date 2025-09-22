import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  ArrowsRightLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Logo from "../assets/logo.png";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: CubeIcon },
    { name: 'Suppliers', href: '/suppliers', icon: BuildingStorefrontIcon },
    { name: 'Transactions', href: '/transactions', icon: ArrowsRightLeftIcon },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex flex-col h-full w-full max-w-xs sm:max-w-sm bg-white shadow-large border-r border-secondary-200">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-secondary-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center justify-center sm:justify-start px-6 mb-6">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <img src={Logo} alt="ERP Lite" className="h-10 sm:h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
            <nav className="mt-6 px-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium'
                        : 'text-secondary-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 active:bg-primary-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-4 h-6 w-6 flex-shrink-0 transition-colors ${
                      isActive(item.href) ? 'text-white' : 'text-secondary-400 group-hover:text-primary-600'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>      {/* Tablet sidebar (md to lg) */}
      <div className="hidden md:flex lg:hidden md:w-20 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-large border-r border-secondary-200">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center flex-shrink-0 px-2 mb-8">
              <Link to="/">
                <img src={Logo} alt="ERP Lite" className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium'
                        : 'text-secondary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700'
                    }`}
                    title={item.name}
                  >
                    <Icon className={`h-6 w-6 transition-colors ${
                      isActive(item.href) ? 'text-white' : 'text-secondary-400 group-hover:text-primary-600'
                    }`} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 xl:w-80 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-large border-r border-secondary-200">
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 xl:px-8 mb-8">
              <Link to="/">
                <img src={Logo} alt="ERP Lite" className="h-14 lg:h-16 xl:h-18 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
            <nav className="mt-6 flex-1 px-4 xl:px-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 xl:px-5 py-3 xl:py-4 text-base lg:text-lg font-medium rounded-xl transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium'
                        : 'text-secondary-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700'
                    }`}
                  >
                    <Icon className={`mr-4 xl:mr-5 h-6 w-6 lg:h-7 lg:w-7 flex-shrink-0 transition-colors ${
                      isActive(item.href) ? 'text-white' : 'text-secondary-400 group-hover:text-primary-600'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-20 lg:pl-72 xl:pl-80 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-2 pt-2 sm:pl-4 sm:pt-4 bg-white/80 backdrop-blur-md border-b border-secondary-200 shadow-soft">
          <div className="flex items-center justify-between h-16">
            <button
              className="h-12 w-12 inline-flex items-center justify-center rounded-xl text-secondary-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 active:bg-primary-100 transition-all duration-300"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center pr-4">
              <Link to="/">
                <img src={Logo} alt="ERP Lite" className="h-8 w-auto sm:hidden cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>
        <main className="flex-1">
          <div className="py-6 sm:py-8 lg:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;