"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Layers,
  DoorOpen,
  Lock,
  Camera,
  GripVertical,
} from "lucide-react";
import { cn } from "@repo/ui";
import type { ZezamiiNode, NodeType } from "../types";

interface SpaceNodeProps {
  node: ZezamiiNode;
  isSelected: boolean;
  isDragOver: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, position: { x: number; y: number }) => void;
  onDrop: (targetId: string, droppedId: string) => void;
  canAcceptDrop: (targetType: NodeType, droppedType: NodeType) => boolean;
  draggedNodeType?: NodeType;
}

const nodeIcons: Record<NodeType, typeof Building2> = {
  Building: Building2,
  Floor: Layers,
  Room: DoorOpen,
};

const nodeColors: Record<
  NodeType,
  { bg: string; border: string; icon: string }
> = {
  Building: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/40",
    icon: "text-indigo-400",
  },
  Floor: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
    icon: "text-blue-400",
  },
  Room: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/40",
    icon: "text-teal-400",
  },
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  alert: "bg-yellow-500",
  offline: "bg-red-500",
};

export const SpaceNode = memo(function SpaceNode({
  node,
  isSelected,
  isDragOver,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop: _onDrop,
  canAcceptDrop,
  draggedNodeType,
}: SpaceNodeProps) {
  const Icon = nodeIcons[node.type];
  const colors = nodeColors[node.type];

  const canBeDropTarget = useMemo(() => {
    if (!draggedNodeType) return false;
    return canAcceptDrop(node.type, draggedNodeType);
  }, [node.type, draggedNodeType, canAcceptDrop]);

  const totalAssets = node.assets.locks + node.assets.cameras;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: node.position.x, y: node.position.y }}
      animate={{
        x: node.position.x,
        y: node.position.y,
        scale: isSelected ? 1.02 : 1,
      }}
      onDragStart={() => onDragStart(node.id)}
      onDragEnd={(_, info) => {
        onDragEnd(node.id, {
          x: node.position.x + info.offset.x,
          y: node.position.y + info.offset.y,
        });
      }}
      onClick={() => onSelect(node.id)}
      className={cn(
        "absolute w-56 rounded-xl border-2 shadow-lg cursor-grab active:cursor-grabbing",
        "transition-all duration-200",
        colors.bg,
        colors.border,
        isSelected &&
          "ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900",
        isDragOver &&
          canBeDropTarget &&
          "ring-2 ring-green-500 ring-offset-2 ring-offset-slate-900 border-green-500",
        isDragOver &&
          !canBeDropTarget &&
          "ring-2 ring-red-500/50 ring-offset-2 ring-offset-slate-900",
        node.isPulsing && "animate-pulse",
      )}
      style={{ zIndex: isSelected ? 50 : 10 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pulse animation overlay for active transactions */}
      {node.isPulsing && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-cyan-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Drag Handle */}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 p-1 opacity-50 hover:opacity-100">
        <GripVertical className="w-4 h-4 text-slate-500" />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", colors.bg)}>
              <Icon className={cn("w-4 h-4", colors.icon)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {node.name}
              </h3>
              <span className="text-xs text-slate-400">{node.type}</span>
            </div>
          </div>
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              statusColors[node.status],
            )}
          />
        </div>

        {/* Assets - Device Health Badges */}
        {totalAssets > 0 && (
          <div className="flex items-center gap-2 mb-2">
            {node.assets.locks > 0 && (
              <div className="inline-flex items-center bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3 mr-1" />
                {node.assets.locks}
              </div>
            )}
            {node.assets.cameras > 0 && (
              <div className="inline-flex items-center bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded-md">
                <Camera className="w-3 h-3 mr-1" />
                {node.assets.cameras}
              </div>
            )}
          </div>
        )}

        {/* Drop zone indicator for nesting */}
        {isDragOver && canBeDropTarget && (
          <div className="mt-2 py-2 border-2 border-dashed border-green-500/50 rounded-lg text-center">
            <span className="text-xs text-green-400">Drop to nest here</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});
