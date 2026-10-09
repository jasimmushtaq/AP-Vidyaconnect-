// ============================================================================
// AP VIDYACONNECT — OFFICIAL BRAND LOGO COMPONENT
// Pure Transparent PNG for seamless blending across light & dark backgrounds
// ============================================================================

import React from 'react';

interface BrandLogoProps {
  variant?: 'lockup' | 'stacked' | 'mark' | 'reverse' | 'mono';
  className?: string;
  size?: number | string;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'lockup',
  className = '',
  size,
  showSubtitle = true,
}) => {
  const transparentColorLogo = '/brand/ap-vidyaconnect-logo.png';
  const transparentWhiteLogo = '/brand/ap-vidyaconnect-logo-white.png';
  const transparentEmblem = '/brand/ap-vidyaconnect-mark.png';

  if (variant === 'mark') {
    return (
      <img
        src={transparentEmblem}
        alt="AP VidyaConnect Emblem"
        className={`inline-block object-contain ${className}`}
        style={{ width: size || 38, height: size || 38 }}
      />
    );
  }

  // Reverse / dark surface variant (White typography for dark navy surfaces like sidebar/footer)
  if (variant === 'reverse') {
    return (
      <img
        src={transparentWhiteLogo}
        alt="AP VidyaConnect"
        className={`inline-block object-contain ${className}`}
        style={{ height: 48, width: 'auto', maxHeight: 54 }}
      />
    );
  }

  if (variant === 'mono') {
    return (
      <img
        src={transparentColorLogo}
        alt="AP VidyaConnect"
        className={`inline-block object-contain grayscale opacity-80 ${className}`}
        style={{ width: size || 140, height: 'auto' }}
      />
    );
  }

  if (variant === 'stacked') {
    return (
      <img
        src={transparentColorLogo}
        alt="AP VidyaConnect Platform"
        className={`inline-block object-contain ${className}`}
        style={{ width: size || 180, height: 'auto' }}
      />
    );
  }

  // Default horizontal lockup on light background
  return (
    <img
      src={transparentColorLogo}
      alt="AP VidyaConnect"
      className={`inline-block object-contain h-8 sm:h-10 w-auto ${className}`}
      style={size ? { height: size, width: 'auto' } : undefined}
    />
  );
};
