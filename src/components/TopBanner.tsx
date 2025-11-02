import { Box } from '@mantine/core';

// Top banner with primary brand color and centered square logo
export function TopBanner() {
  const bannerColor = '#10797D'; // main color taken from logo_full.svg
  const base = (import.meta.env && (import.meta.env.BASE_URL as string)) || '/';
  const logoSrc = `${base}logo_full.svg`;

  return (
    <Box component="header" style={{ backgroundColor: bannerColor }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 16 }}>
        <img
          src={logoSrc}
          alt="WhatTheRuck"
          width={128}
          height={128}
        />
      </div>
    </Box>
  );
}
