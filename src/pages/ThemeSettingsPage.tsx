import { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Layout,
  Layers,
  Save,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme, ThemeMode, FontFamily, FontSize, Spacing, BorderRadius, ShadowIntensity } from '@/hooks/useTheme';
import { useNotification } from '@/hooks/useNotification';
import { ResetThemeModal } from '@/components/theme/ResetThemeModal';
import { ComponentPreviewPanel } from '@/components/theme/ComponentPreviewPanel';
import { cn } from '@/lib/utils';

const COLOR_PRESETS = {
  primary: [
    { name: 'Electric Blue', value: '#3b82f6' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Cyan', value: '#06b6d4' },
  ],
  secondary: [
    { name: 'Slate', value: '#64748b' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'Zinc', value: '#71717a' },
    { name: 'Stone', value: '#78716c' },
  ],
  accent: [
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Fuchsia', value: '#d946ef' },
  ],
};

export default function ThemeSettingsPage() {
  const { theme, updateTheme, resetTheme, resolvedMode } = useTheme();
  const { success, error, warning } = useNotification();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    success({ title: 'Theme Saved', description: 'Your theme settings have been saved successfully' });
  };

  const handleReset = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    resetTheme();
    warning({ title: 'Theme Reset', description: 'All theme settings have been restored to defaults' });
  };

  const handleColorChange = (type: 'primary' | 'secondary' | 'accent', value: string) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [type]: value,
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Palette className="w-6 h-6 text-primary" />
              Theme & Appearance
            </h1>
            <p className="text-sm text-muted-foreground">
              Customize the global UI theme for your organization
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setResetModalOpen(true)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Theme
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings Column */}
          <div className="space-y-6">
            {/* Theme Mode */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Sun className="w-5 h-5 text-primary" />
                  Theme Mode
                </CardTitle>
                <CardDescription>
                  Choose how the interface looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light' as ThemeMode, label: 'Light', icon: Sun },
                    { value: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
                    { value: 'system' as ThemeMode, label: 'System', icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateTheme({ mode: value })}
                      className={cn(
                        'relative p-4 rounded-xl border transition-all',
                        theme.mode === value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      {theme.mode === value && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <Icon className={cn(
                        'w-6 h-6 mx-auto mb-2',
                        theme.mode === value ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <p className={cn(
                        'text-sm font-medium text-center',
                        theme.mode === value ? 'text-primary' : ''
                      )}>
                        {label}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Currently using: <span className="font-medium capitalize">{resolvedMode}</span> mode
                </p>
              </CardContent>
            </Card>

            {/* Brand Colors */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Brand Colors
                </CardTitle>
                <CardDescription>
                  Customize your brand palette
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Color */}
                <div className="space-y-3">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {COLOR_PRESETS.primary.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange('primary', color.value)}
                          className={cn(
                            'w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background',
                            theme.colors.primary === color.value && 'ring-2 ring-primary'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-3">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {COLOR_PRESETS.secondary.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange('secondary', color.value)}
                          className={cn(
                            'w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background',
                            theme.colors.secondary === color.value && 'ring-2 ring-primary'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {COLOR_PRESETS.accent.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange('accent', color.value)}
                          className={cn(
                            'w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background',
                            theme.colors.accent === color.value && 'ring-2 ring-primary'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.colors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.colors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Typography
                </CardTitle>
                <CardDescription>
                  Font and text settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Family */}
                <div className="space-y-3">
                  <Label>Font Family</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'inter' as FontFamily, label: 'Inter', preview: 'Aa' },
                      { value: 'system' as FontFamily, label: 'System', preview: 'Aa' },
                      { value: 'custom' as FontFamily, label: 'SF Pro', preview: 'Aa' },
                    ].map(({ value, label, preview }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme({ fontFamily: value })}
                        className={cn(
                          'p-3 rounded-xl border transition-all text-center',
                          theme.fontFamily === value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <p className="text-2xl font-medium mb-1" style={{
                          fontFamily: value === 'inter' ? 'Inter' : value === 'system' ? 'system-ui' : 'SF Pro Display'
                        }}>
                          {preview}
                        </p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <Label>Base Font Size</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'small' as FontSize, label: 'Small', size: '14px' },
                      { value: 'medium' as FontSize, label: 'Medium', size: '16px' },
                      { value: 'large' as FontSize, label: 'Large', size: '18px' },
                    ].map(({ value, label, size }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme({ fontSize: value })}
                        className={cn(
                          'p-3 rounded-xl border transition-all',
                          theme.fontSize === value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <p className="font-medium" style={{ fontSize: size }}>{label}</p>
                        <p className="text-xs text-muted-foreground">{size}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Preferences */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Layout Preferences
                </CardTitle>
                <CardDescription>
                  Spacing, corners, and shadows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Spacing */}
                <div className="space-y-3">
                  <Label>Spacing</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'compact' as Spacing, label: 'Compact', desc: 'Dense UI layout' },
                      { value: 'comfortable' as Spacing, label: 'Comfortable', desc: 'Spacious layout' },
                    ].map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme({ spacing: value })}
                        className={cn(
                          'p-4 rounded-xl border transition-all text-left',
                          theme.spacing === value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div className="space-y-3">
                  <Label>Card Radius</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'sharp' as BorderRadius, label: 'Sharp', radius: '4px' },
                      { value: 'rounded' as BorderRadius, label: 'Rounded', radius: '12px' },
                    ].map(({ value, label, radius }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme({ borderRadius: value })}
                        className={cn(
                          'p-4 border transition-all text-center',
                          theme.borderRadius === value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50'
                        )}
                        style={{ borderRadius: radius }}
                      >
                        <div
                          className="w-8 h-8 bg-primary/20 mx-auto mb-2"
                          style={{ borderRadius: radius }}
                        />
                        <p className="font-medium">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shadow Intensity */}
                <div className="space-y-3">
                  <Label>Shadow Intensity</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'low' as ShadowIntensity, label: 'Low', shadow: '0 2px 4px rgba(0,0,0,0.05)' },
                      { value: 'medium' as ShadowIntensity, label: 'Medium', shadow: '0 4px 12px rgba(0,0,0,0.15)' },
                    ].map(({ value, label, shadow }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme({ shadowIntensity: value })}
                        className={cn(
                          'p-4 rounded-xl border transition-all text-center',
                          theme.shadowIntensity === value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <div
                          className="w-12 h-8 bg-background mx-auto mb-2 rounded-lg"
                          style={{ boxShadow: shadow }}
                        />
                        <p className="font-medium">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Column */}
          <div className="space-y-6">
            <Card className="gradient-card sticky top-6">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Component Preview
                </CardTitle>
                <CardDescription>
                  Live preview of your theme settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComponentPreviewPanel />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      <ResetThemeModal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        onReset={handleReset}
      />
    </AppLayout>
  );
}
