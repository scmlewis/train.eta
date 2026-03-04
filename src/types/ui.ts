import type { ComponentType, SVGProps } from 'react';

// Icon component type used across the UI for SVG icon components
export type IconComp = ComponentType<SVGProps<SVGSVGElement> & { size?: number; className?: string }>; 
