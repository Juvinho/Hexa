export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    dark: string;
  };
}

export const themes: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Hexa Original',
    colors: {
      primary: '#4F46E5', // Indigo 600
      secondary: '#7C3AED', // Violet 600
      dark: '#020617', // Slate 950
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9', // Sky 500
      secondary: '#0284c7', // Sky 600
      dark: '#0c4a6e', // Sky 950
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      primary: '#10b981', // Emerald 500
      secondary: '#059669', // Emerald 600
      dark: '#064e3b', // Emerald 950
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: {
      primary: '#f97316', // Orange 500
      secondary: '#ea580c', // Orange 600
      dark: '#431407', // Orange 950
    },
  },
  {
    id: 'cyber',
    name: 'Cyber Pink',
    colors: {
      primary: '#d946ef', // Fuchsia 500
      secondary: '#c026d3', // Fuchsia 600
      dark: '#4a044e', // Fuchsia 950
    },
  },
];

export const fonts = [
  { id: 'inter', name: 'Inter', value: '"Inter", sans-serif' },
  { id: 'roboto', name: 'Roboto', value: '"Roboto", sans-serif' },
  { id: 'poppins', name: 'Poppins', value: '"Poppins", sans-serif' },
  { id: 'mono', name: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
];

export const borderRadii = [
  { id: 'none', name: 'Square', value: '0px' },
  { id: 'sm', name: 'Small', value: '0.25rem' },
  { id: 'md', name: 'Medium', value: '0.5rem' },
  { id: 'lg', name: 'Large', value: '1rem' },
  { id: 'full', name: 'Round', value: '9999px' },
];
