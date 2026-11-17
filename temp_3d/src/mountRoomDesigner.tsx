import React from 'react';
import ReactDOM from 'react-dom/client';
import { RoomDesignerSection } from './components/RoomDesignerSection';
import './index.css';

export function mountRoomDesigner(targetId = 'susri-3d-atelier') {
  const container = document.getElementById(targetId);
  if (!container) {
    console.warn(`[SUSRI 3D] Container element #${targetId} not found.`);
    return;
  }
  
  // Clean container
  container.innerHTML = '';
  
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <RoomDesignerSection />
    </React.StrictMode>
  );
}

// Auto-mount when DOM is ready
if (typeof window !== 'undefined') {
  (window as any).mountRoomDesigner = mountRoomDesigner;

  const init = () => {
    const el = document.getElementById('susri-3d-atelier');
    if (el) {
      mountRoomDesigner('susri-3d-atelier');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

