import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const COLORS = {
  success: { bg: '#006565', text: '#fff', icon: 'check_circle' },
  error:   { bg: '#ba1a1a', text: '#fff', icon: 'error' },
  warning: { bg: '#7d5700', text: '#fff', icon: 'warning' },
  info:    { bg: '#313030', text: '#fff', icon: 'info' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:9999, display:'flex', flexDirection:'column', gap:'10px', maxWidth:'360px' }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div
              key={t.id}
              onClick={() => remove(t.id)}
              className="toast-enter"
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                background: c.bg, color: c.text,
                padding:'12px 16px', borderRadius:'12px',
                fontFamily:"'Fustat',sans-serif", fontSize:'14px', fontWeight:500,
                boxShadow:'0 4px 16px rgba(0,0,0,0.18)',
                cursor:'pointer', maxWidth:'100%',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize:20, flexShrink:0 }}>{c.icon}</span>
              <span style={{ flex:1 }}>{t.message}</span>
              <span className="material-symbols-outlined" style={{ fontSize:18, flexShrink:0, opacity:0.6 }}>close</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
