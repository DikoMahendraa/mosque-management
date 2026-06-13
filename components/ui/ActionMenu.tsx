'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  hidden?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
}

const MENU_OFFSET = 4;
const VIEWPORT_PADDING = 8;
const ESTIMATED_ITEM_HEIGHT = 40;

function computeMenuPosition(
  trigger: HTMLElement,
  menu: HTMLElement | null,
  itemCount: number,
  align: 'left' | 'right'
) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = menu?.offsetHeight ?? itemCount * ESTIMATED_ITEM_HEIGHT + 8;
  const menuWidth = menu?.offsetWidth ?? 176;

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const openUpward =
    spaceBelow < menuHeight + MENU_OFFSET + VIEWPORT_PADDING &&
    spaceAbove > spaceBelow;

  const top = openUpward
    ? rect.top - menuHeight - MENU_OFFSET
    : rect.bottom + MENU_OFFSET;

  const left =
    align === 'right'
      ? Math.min(
          Math.max(VIEWPORT_PADDING, rect.right - menuWidth),
          window.innerWidth - menuWidth - VIEWPORT_PADDING
        )
      : Math.min(
          Math.max(VIEWPORT_PADDING, rect.left),
          window.innerWidth - menuWidth - VIEWPORT_PADDING
        );

  return {
    top: Math.max(VIEWPORT_PADDING, top),
    left,
  };
}

function applyMenuPosition(
  trigger: HTMLElement,
  menu: HTMLElement,
  itemCount: number,
  align: 'left' | 'right'
) {
  const { top, left } = computeMenuPosition(trigger, menu, itemCount, align);
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

export default function ActionMenu({ items, align = 'right' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter((item) => !item.hidden);

  const repositionMenu = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    applyMenuPosition(trigger, menu, visibleItems.length, align);
  }, [align, visibleItems.length]);

  useLayoutEffect(() => {
    if (!open) return;
    repositionMenu();
  }, [open, repositionMenu]);

  useEffect(() => {
    if (!open) return;

    const handleScrollOrResize = () => repositionMenu();
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [open, repositionMenu]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (visibleItems.length === 0) return null;

  const handleToggle = () => {
    setOpen((current) => !current);
  };

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] min-w-[11rem] rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
          >
            {visibleItems.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left',
                  item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {item.icon && <span className="shrink-0 text-gray-400">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Menu aksi"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu}
    </>
  );
}
