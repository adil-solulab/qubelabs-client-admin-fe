import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontFamily = 'inter' | 'system' | 'custom';
export type FontSize = 'small' | 'medium' | 'large';
export type Spacing = 'compact' | 'comfortable';
export type BorderRadius = 'sharp' | 'rounded';
export type ShadowIntensity = 'low' | 'medium';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  fontFamily: FontFamily;
  fontSize: FontSize;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadowIntensity: ShadowIntensity;
}

const defaultTheme: ThemeConfig = {
  mode: 'system',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#06b6d4',
  },
  fontFamily: 'inter',
  fontSize: 'medium',
  spacing: 'comfortable',
  borderRadius: 'rounded',
  shadowIntensity: 'medium',
};

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 217, s: 91, l: 60 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  // Resolve system theme
  useEffect(() => {
    const updateResolvedMode = () => {
      if (theme.mode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedMode(isDark ? 'dark' : 'light');
      } else {
        setResolvedMode(theme.mode);
      }
    };

    updateResolvedMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateResolvedMode);
    
    return () => mediaQuery.removeEventListener('change', updateResolvedMode);
  }, [theme.mode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply mode
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedMode);
    
    // Apply colors
    const primaryHSL = hexToHSL(theme.colors.primary);
    const secondaryHSL = hexToHSL(theme.colors.secondary);
    const accentHSL = hexToHSL(theme.colors.accent);
    
    root.style.setProperty('--primary', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    root.style.setProperty('--primary-glow', `${primaryHSL.h} ${primaryHSL.s}% ${Math.min(primaryHSL.l + 10, 90)}%`);
    root.style.setProperty('--ring', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    root.style.setProperty('--sidebar-primary', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    root.style.setProperty('--sidebar-ring', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
    
    root.style.setProperty('--secondary', `${secondaryHSL.h} ${secondaryHSL.s}% ${resolvedMode === 'dark' ? 15 : 96}%`);
    root.style.setProperty('--muted', `${secondaryHSL.h} ${secondaryHSL.s}% ${resolvedMode === 'dark' ? 15 : 96}%`);
    root.style.setProperty('--muted-foreground', `${secondaryHSL.h} ${Math.max(secondaryHSL.s - 5, 0)}% ${resolvedMode === 'dark' ? 60 : 46}%`);
    
    root.style.setProperty('--accent', `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
    
    // Apply font family
    const fontMap: Record<FontFamily, string> = {
      inter: "'Inter', system-ui, sans-serif",
      system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      custom: "'SF Pro Display', 'Helvetica Neue', sans-serif",
    };
    root.style.setProperty('--font-family', fontMap[theme.fontFamily]);
    document.body.style.fontFamily = fontMap[theme.fontFamily];
    
    // Apply font size
    const sizeMap: Record<FontSize, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--font-size-base', sizeMap[theme.fontSize]);
    
    // Apply spacing
    const spacingMap: Record<Spacing, string> = {
      compact: '0.5rem',
      comfortable: '1rem',
    };
    root.style.setProperty('--spacing-unit', spacingMap[theme.spacing]);
    
    // Apply border radius
    const radiusMap: Record<BorderRadius, string> = {
      sharp: '0.25rem',
      rounded: '0.75rem',
    };
    root.style.setProperty('--radius', radiusMap[theme.borderRadius]);
    
    // Apply shadow intensity
    if (theme.shadowIntensity === 'low') {
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 hsl(222 47% 11% / 0.03)');
      root.style.setProperty('--shadow-md', '0 2px 4px -1px hsl(222 47% 11% / 0.05)');
      root.style.setProperty('--shadow-lg', '0 4px 8px -2px hsl(222 47% 11% / 0.05)');
    } else {
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 hsl(222 47% 11% / 0.05)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px hsl(222 47% 11% / 0.1), 0 2px 4px -2px hsl(222 47% 11% / 0.1)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px hsl(222 47% 11% / 0.1), 0 4px 6px -4px hsl(222 47% 11% / 0.1)');
    }
    
    // Save to localStorage
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }, [theme, resolvedMode]);

  const setTheme = useCallback((newTheme: ThemeConfig) => {
    setThemeState(newTheme);
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);
    localStorage.removeItem('app-theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, updateTheme, resetTheme, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { defaultTheme };
