// Spatial Insights Types

export type NodeType = 'Building' | 'Floor' | 'Room';

export type NodeStatus = 'active' | 'alert' | 'offline';

export interface ZezamiiNode {
  id: string;
  name: string;
  type: NodeType;
  parentId?: string; // Links a Room to a Building/Floor
  position: { x: number; y: number }; // Absolute coords on canvas
  assets: {
    locks: number;
    cameras: number;
  };
  status: NodeStatus;
  isPulsing?: boolean; // True when there's recent activity (door unlocked, etc.)
}

export interface DragItem {
  id: string;
  type: 'node' | 'device';
  nodeType?: NodeType;
}

export interface CanvasState {
  nodes: ZezamiiNode[];
  selectedNodeId: string | null;
  dragOverNodeId: string | null;
}
