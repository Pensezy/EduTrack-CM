/**
 * UTILITAIRES DE RESPONSIVITÉ
 *
 * Breakpoints cohérents pour toute l'application
 * Basés sur Tailwind CSS defaults
 */

export const BREAKPOINTS = {
  xs: 0,      // Mobile portrait
  sm: 640,    // Mobile landscape
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape / Desktop small
  xl: 1280,   // Desktop
  '2xl': 1536 // Desktop large
};

/**
 * Hook personnalisé pour détecter la taille d'écran
 * Usage: const { isMobile, isTablet, isDesktop } = useResponsive();
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: screenSize.width < BREAKPOINTS.md,
    isTablet: screenSize.width >= BREAKPOINTS.md && screenSize.width < BREAKPOINTS.lg,
    isDesktop: screenSize.width >= BREAKPOINTS.lg,
    isSmallMobile: screenSize.width < BREAKPOINTS.sm,
    isLargeDesktop: screenSize.width >= BREAKPOINTS.xl,
    width: screenSize.width,
    height: screenSize.height
  };
};

/**
 * Classes TailwindCSS responsives pré-configurées
 */
export const RESPONSIVE_CLASSES = {
  // Containers
  container: 'w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
  containerFluid: 'w-full px-4 sm:px-6 lg:px-8',
  containerNarrow: 'w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl',

  // Grilles
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6',
  grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
  grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6',

  // Flex
  flexCol: 'flex flex-col space-y-4',
  flexRow: 'flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0',
  flexResponsive: 'flex flex-col lg:flex-row gap-4 lg:gap-6',

  // Cartes
  card: 'bg-white rounded-lg shadow-card p-4 md:p-6',
  cardCompact: 'bg-white rounded-lg shadow-card p-3 md:p-4',

  // Textes
  heading1: 'text-2xl sm:text-3xl lg:text-4xl font-heading font-bold',
  heading2: 'text-xl sm:text-2xl lg:text-3xl font-heading font-semibold',
  heading3: 'text-lg sm:text-xl lg:text-2xl font-heading font-semibold',
  heading4: 'text-base sm:text-lg lg:text-xl font-heading font-semibold',
  body: 'text-sm sm:text-base',
  caption: 'text-xs sm:text-sm',

  // Boutons
  button: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base',
  buttonLarge: 'px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg',
  buttonSmall: 'px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm',

  // Tables
  tableWrapper: 'overflow-x-auto -mx-4 sm:mx-0',
  tableContainer: 'min-w-full inline-block align-middle',

  // Modals
  modalContainer: 'w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-4',
  modalPadding: 'p-4 sm:p-6 md:p-8',

  // Sidebar
  sidebarWidth: 'w-64 lg:w-72',
  sidebarCollapsedWidth: 'w-16 lg:w-20',

  // Spacing
  sectionPadding: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
  pagePadding: 'p-4 sm:p-6 lg:p-8',
};

/**
 * Fonction pour combiner des classes conditionnellement
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Fonction pour obtenir la classe responsive selon la taille d'écran
 */
export const getResponsiveClass = (base, variants = {}) => {
  return cn(
    base,
    variants.sm && `sm:${variants.sm}`,
    variants.md && `md:${variants.md}`,
    variants.lg && `lg:${variants.lg}`,
    variants.xl && `xl:${variants.xl}`
  );
};

// Import React pour le hook
import { useState, useEffect } from 'react';
