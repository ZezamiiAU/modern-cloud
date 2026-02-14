"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { SpaceNode } from "./space-node";
import type { ZezamiiNode, NodeType, NodeStatus } from "../types";
import type { Zone, Device, Transaction } from "@/contexts/site-context";

interface SpatialCanvasProps {
  zones: Zone[];
  devices: Device[];
  transactions: Transaction[];
  selectedSiteId: string | null;
  selectedZoneId: string | null;
  onAddSpace: () => void;
  onNodeSelect: (nodeId: string | null) => void;
  onDeviceClick: (deviceId: string) => void;
}

// Map Zone types to NodeType
function mapZoneType(type: Zone["type"]): NodeType | null {
  switch (type) {
    case "building":
      return "Building";
    case "floor":
      return "Floor";
    case "room":
    case "area":
      return "Room";
    default:
      return null;
  }
}

// Valid parent-child relationships
const validNesting: Record<NodeType, NodeType[]> = {
  Building: ["Floor", "Room"], // Buildings can contain floors and rooms
  Floor: ["Room"], // Floors can contain rooms
  Room: [], // Rooms cannot contain other nodes
};

export function SpatialCanvas({
  zones,
  devices,
  transactions,
  selectedSiteId,
  selectedZoneId,
  onAddSpace,
  onNodeSelect,
  onDeviceClick: _onDeviceClick,
}: SpatialCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ZezamiiNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Convert zones to nodes
  useEffect(() => {
    if (!selectedSiteId) {
      setNodes([]);
      return;
    }

    // Filter zones for current site and context
    let relevantZones = zones.filter(
      (z) => z.siteId === selectedSiteId && !z.isDefault,
    );

    if (selectedZoneId) {
      const selectedZone = zones.find((z) => z.id === selectedZoneId);
      if (selectedZone) {
        // Get the selected zone and all its descendants
        const getDescendants = (parentId: string): Zone[] => {
          const children = zones.filter((z) => z.parentId === parentId);
          return children.reduce(
            (acc, child) => [...acc, child, ...getDescendants(child.id)],
            [] as Zone[],
          );
        };
        relevantZones = [selectedZone, ...getDescendants(selectedZoneId)];
      }
    }

    // Calculate positions for nodes
    const nodesByType: Record<string, Zone[]> = {
      building: [],
      floor: [],
      room: [],
      area: [],
    };

    relevantZones.forEach((zone) => {
      const typeArray = nodesByType[zone.type];
      if (typeArray) {
        typeArray.push(zone);
      }
    });

    const convertedNodes: ZezamiiNode[] = relevantZones
      .map((zone, index): ZezamiiNode | null => {
        const nodeType = mapZoneType(zone.type);
        if (!nodeType) return null;

        // Get devices for this zone
        const zoneDevices = devices.filter((d) => d.zoneId === zone.id);
        const locks = zoneDevices.filter(
          (d) => d.type === "digital-lock" || d.type === "access-reader",
        ).length;
        const cameras = zoneDevices.filter((d) => d.type === "camera").length;

        // Check for recent transactions (last 5 minutes)
        const recentTransactions = transactions.filter(
          (t) =>
            zoneDevices.some((d) => d.id === t.assetId) &&
            Date.now() - t.timestamp.getTime() < 5 * 60 * 1000,
        );
        const hasRecentUnlock = recentTransactions.some(
          (t) => t.type === "unlock",
        );

        // Determine status
        const onlineDevices = zoneDevices.filter(
          (d) => d.status === "online",
        ).length;
        const totalDevices = zoneDevices.length;
        let status: NodeStatus = "active";
        if (totalDevices > 0) {
          if (onlineDevices === 0) {
            status = "offline";
          } else if (onlineDevices < totalDevices) {
            status = "alert";
          }
        }

        // Use existing position or calculate new one based on type
        let xPos = zone.coordinates?.x ?? 0;
        let yPos = zone.coordinates?.y ?? 0;

        if (
          zone.coordinates?.x === undefined ||
          zone.coordinates?.y === undefined
        ) {
          // Calculate position based on type and index
          const typeIndex =
            nodesByType[zone.type]?.findIndex((z) => z.id === zone.id) ?? index;
          const column = typeIndex % 3;
          const row = Math.floor(typeIndex / 3);

          switch (zone.type) {
            case "building":
              xPos = 50 + column * 280;
              yPos = 50 + row * 180;
              break;
            case "floor":
              xPos = 50 + column * 280;
              yPos = 280 + row * 180;
              break;
            case "room":
            case "area":
              xPos = 50 + column * 280;
              yPos = 510 + row * 180;
              break;
          }
        }

        return {
          id: zone.id,
          name: zone.name,
          type: nodeType,
          parentId: zone.parentId ?? undefined,
          position: { x: xPos, y: yPos },
          assets: { locks, cameras },
          status,
          isPulsing: hasRecentUnlock,
        };
      })
      .filter((n): n is ZezamiiNode => n !== null);

    setNodes(convertedNodes);
  }, [zones, devices, transactions, selectedSiteId, selectedZoneId]);

  // Handle node selection
  const handleNodeSelect = useCallback(
    (id: string) => {
      setSelectedNodeId(id);
      onNodeSelect(id);
    },
    [onNodeSelect],
  );

  // Handle drag start
  const handleDragStart = useCallback((id: string) => {
    setDraggingNodeId(id);
  }, []);

  // Handle drag end - update node position
  const handleDragEnd = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === id
            ? {
                ...node,
                position: {
                  x: Math.max(0, position.x),
                  y: Math.max(0, position.y),
                },
              }
            : node,
        ),
      );
      setDraggingNodeId(null);
      setDragOverNodeId(null);
    },
    [],
  );

  // Handle drop for nesting
  const handleDrop = useCallback((targetId: string, droppedId: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === droppedId ? { ...node, parentId: targetId } : node,
      ),
    );
  }, []);

  // Check if a drop is valid
  const canAcceptDrop = useCallback(
    (targetType: NodeType, droppedType: NodeType): boolean => {
      return validNesting[targetType]?.includes(droppedType) ?? false;
    },
    [],
  );

  // Get dragged node type
  const draggedNodeType = useMemo(() => {
    if (!draggingNodeId) return undefined;
    return nodes.find((n) => n.id === draggingNodeId)?.type;
  }, [draggingNodeId, nodes]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  }, []);

  // Detect drag over nodes
  useEffect(() => {
    if (!canvasRef.current || !draggingNodeId) return;

    const handlePointerMove = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Find node under cursor (excluding the dragged node)
      const nodeUnderCursor = nodes.find((node) => {
        if (node.id === draggingNodeId) return false;
        const nodeWidth = 224; // w-56 = 14rem = 224px
        const nodeHeight = 120; // approximate height
        return (
          x >= node.position.x &&
          x <= node.position.x + nodeWidth &&
          y >= node.position.y &&
          y <= node.position.y + nodeHeight
        );
      });

      setDragOverNodeId(nodeUnderCursor?.id ?? null);
    };

    document.addEventListener("pointermove", handlePointerMove);
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, [draggingNodeId, nodes, zoom]);

  if (!selectedSiteId) {
    return null;
  }

  return (
    <div className="relative w-full h-full bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg border border-slate-700 p-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs text-slate-400 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onAddSpace}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Space
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-4 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-indigo-500/40 border border-indigo-500/60" />
          <span className="text-xs text-slate-400">Building</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500/40 border border-blue-500/60" />
          <span className="text-xs text-slate-400">Floor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-teal-500/40 border border-teal-500/60" />
          <span className="text-xs text-slate-400">Room</span>
        </div>
      </div>

      {/* Canvas Area */}
      <motion.div
        ref={canvasRef}
        className="relative w-full h-full min-h-[600px]"
        style={{
          transform: `scale(${zoom}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          transformOrigin: "top left",
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Connection lines between parent/child nodes */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "visible" }}
        >
          {nodes.map((node) => {
            if (!node.parentId) return null;
            const parent = nodes.find((n) => n.id === node.parentId);
            if (!parent) return null;

            const nodeWidth = 224;
            const nodeHeight = 120;

            // Calculate center points
            const startX = parent.position.x + nodeWidth / 2;
            const startY = parent.position.y + nodeHeight;
            const endX = node.position.x + nodeWidth / 2;
            const endY = node.position.y;

            // Calculate control points for curved line
            const midY = (startY + endY) / 2;

            return (
              <path
                key={`${node.parentId}-${node.id}`}
                d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                fill="none"
                stroke="rgba(148, 163, 184, 0.3)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <SpaceNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isDragOver={dragOverNodeId === node.id}
            onSelect={handleNodeSelect}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            canAcceptDrop={canAcceptDrop}
            draggedNodeType={draggedNodeType}
          />
        ))}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 mb-4">
                No spaces yet. Add buildings, floors, and rooms to get started.
              </p>
              <button
                onClick={onAddSpace}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Space
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
