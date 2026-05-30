import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const defaultAccentColor = 'var(--component-active-color-default, #10b981)'; // emerald-500

export default function InteractiveMenu({ items, activeItem, onItemClick, onMoreClick, accentColor }) {
  const itemRefs = useRef([]);
  const textRefs = useRef([]);

  // Find index of the active item based on the current active id
  const activeIndex = items.findIndex(i => i.id === activeItem);

  useEffect(() => {
    const setLineWidth = () => {
      // Find the currently active item
      const index = activeIndex >= 0 ? activeIndex : -1;
      if (index === -1) return;

      const activeItemElement = itemRefs.current[index];
      const activeTextElement = textRefs.current[index];

      if (activeItemElement && activeTextElement) {
        // Measure text width precisely without constraints
        const oldMaxWidth = activeTextElement.style.maxWidth;
        activeTextElement.style.maxWidth = 'none';
        const textWidth = activeTextElement.offsetWidth;
        activeTextElement.style.maxWidth = oldMaxWidth;

        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndex, items]);

  const navStyle = useMemo(() => {
      const activeColor = accentColor || defaultAccentColor;
      return { '--component-active-color': activeColor };
  }, [accentColor]); 

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dashboard-surface border-t border-stone-200 dark:border-dashboard-border px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex justify-between items-center shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] transition-colors duration-300"
      role="navigation"
      style={navStyle}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            className={`relative flex items-center justify-center gap-2 p-2.5 rounded-2xl transition-all duration-300 overflow-hidden ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 bg-transparent'}`}
            onClick={() => item.isMore ? onMoreClick() : onItemClick(item.id)}
            ref={(el) => (itemRefs.current[index] = el)}
            style={{ '--lineWidth': '0px' }} 
          >
            <div className="flex items-center justify-center z-10">
              <IconComponent className="w-6 h-6 stroke-2" />
            </div>
            
            <strong
              className={`font-sans font-semibold text-sm whitespace-nowrap block transition-all duration-300 z-10 capitalize ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
              style={{ maxWidth: isActive ? 'var(--lineWidth, 80px)' : '0px' }}
              ref={(el) => (textRefs.current[index] = el)}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
}
