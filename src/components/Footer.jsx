'use client';

import React from 'react';
import { siteConfig } from '@/config/siteConfig';

export default function Footer() {
  return (
    <footer className="footer-copyright">
      {siteConfig.footer.copyright}
    </footer>
  );
}
