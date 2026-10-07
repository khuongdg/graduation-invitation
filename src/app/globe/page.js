'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import JourneyGlobeModal from '@/components/JourneyGlobeModal';

export default function JourneyGlobePage() {
  const router = useRouter();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Journey 3D Globe - Kỷ niệm TDTU';
    }

    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/journey');
        const data = await res.json();
        if (data.success && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
      } catch (err) {
        console.error('Failed to fetch journey photos for globe page', err);
      }
    };
    fetchPhotos();
  }, []);

  const handleClose = () => {
    router.push('/');
  };

  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#04050d' }}>
      <JourneyGlobeModal
        isOpen={true}
        onClose={handleClose}
        photos={photos}
      />
    </main>
  );
}
