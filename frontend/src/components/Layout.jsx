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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex flex-col h-full w-full max-w-xs sm:max-w-sm bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-gray-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 flex flex-col pt-4 sm:pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center justify-center sm:justify-start px-4">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <img src={Logo} alt="ERP Lite" className="h-8 sm:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
            <nav className="mt-4 sm:mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 sm:px-2 py-3 sm:py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>      {/* Tablet sidebar (md to lg) */}
      <div className="hidden md:flex lg:hidden md:w-16 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center flex-shrink-0 px-2 mb-8">
              <Link to="/">
                <img src={Logo} alt="ERP Lite" className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center justify-center p-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={item.name}
                  >
                    <Icon className="h-6 w-6" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 xl:px-6 mb-6 lg:mb-8">
              <Link to="/">
                <img src={Logo} alt="ERP Lite" className="h-12 lg:h-14 xl:h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 xl:px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 xl:px-3 py-2 xl:py-3 text-sm lg:text-base font-medium rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 xl:mr-4 h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-16 lg:pl-64 xl:pl-72 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50 border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 active:bg-gray-100 transition-colors"
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
          <div className="py-4 sm:py-6 lg:py-8">
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