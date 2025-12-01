// Reusable drag-to-reorder hook extracted from MicroRIASEC
// Supports both desktop drag-and-drop and mobile up/down buttons

import { useState, useCallback } from 'react';

interface DraggableItem {
  id: string | number;
  [key: string]: unknown;
}

export function useDragReorder<T extends DraggableItem>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [draggedId, setDraggedId] = useState<string | number | null>(null);

  const handleDragStart = useCallback((id: string | number) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetId: string | number) => {
      e.preventDefault();
      if (draggedId === null || draggedId === targetId) return;

      setItems((prev) => {
        const draggedIndex = prev.findIndex((item) => item.id === draggedId);
        const targetIndex = prev.findIndex((item) => item.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return prev;
        
        const newItems = [...prev];
        const [removed] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, removed);
        return newItems;
      });
    },
    [draggedId]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  // Mobile fallback: move up
  const moveUp = useCallback((id: string | number) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index <= 0) return prev;
      const newItems = [...prev];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems;
    });
  }, []);

  // Mobile fallback: move down
  const moveDown = useCallback((id: string | number) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index >= prev.length - 1) return prev;
      const newItems = [...prev];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return newItems;
    });
  }, []);

  const reset = useCallback(() => {
    setItems(initialItems);
    setDraggedId(null);
  }, [initialItems]);

  return {
    items,
    draggedId,
    isDragging: draggedId !== null,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    moveUp,
    moveDown,
    reset,
    setItems,
  };
}
