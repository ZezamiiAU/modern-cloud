"use client";

import { memo, useState, useMemo } from "react";
import { Building2, Layers, DoorOpen, Grid3X3 } from "lucide-react";
import {
  cn,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import type { Zone } from "@/contexts/site-context";

type SpaceType = "building" | "floor" | "room" | "area";

interface AddSpaceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: SpaceType, parentId?: string) => void;
  zones?: Zone[];
  selectedZoneId?: string | null;
}

const spaceTypes: {
  value: SpaceType;
  label: string;
  icon: typeof Building2;
  description: string;
}[] = [
  {
    value: "building",
    label: "Building",
    icon: Building2,
    description: "A physical building structure at your site",
  },
  {
    value: "floor",
    label: "Floor",
    icon: Layers,
    description: "A floor or level within a building",
  },
  {
    value: "room",
    label: "Room",
    icon: DoorOpen,
    description: "Enclosed space with defined boundaries",
  },
  {
    value: "area",
    label: "Area",
    icon: Grid3X3,
    description: "Open space or zone within a floor",
  },
];

// Valid parent types for each space type
const validParentTypes: Record<SpaceType, SpaceType[]> = {
  building: [], // Buildings are root-level
  floor: ["building"], // Floors go in buildings
  room: ["building", "floor"], // Rooms can go in buildings or floors
  area: ["building", "floor"], // Areas can go in buildings or floors
};

export const AddSpaceDialog = memo(function AddSpaceDialog({
  open,
  onClose,
  onSubmit,
  zones = [],
  selectedZoneId,
}: AddSpaceDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SpaceType>("room");
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  // Get valid parent options based on selected type
  const parentOptions = useMemo(() => {
    const validTypes = validParentTypes[type];
    if (validTypes.length === 0) return [];

    return zones.filter(
      (z) => validTypes.includes(z.type as SpaceType) && !z.isDefault
    );
  }, [zones, type]);

  // Auto-select parent if there's only one option or if selectedZoneId is a valid parent
  useMemo(() => {
    if (selectedZoneId) {
      const selectedZone = zones.find((z) => z.id === selectedZoneId);
      if (selectedZone && validParentTypes[type].includes(selectedZone.type as SpaceType)) {
        setParentId(selectedZoneId);
        return;
      }
    }
    const firstParent = parentOptions[0];
    if (parentOptions.length === 1 && firstParent) {
      setParentId(firstParent.id);
    } else if (parentOptions.length === 0) {
      setParentId(undefined);
    }
  }, [selectedZoneId, zones, type, parentOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate parent selection for types that require it
    if (validParentTypes[type].length > 0 && !parentId) {
      // If parent is required but not selected, don't submit
      return;
    }

    onSubmit(name.trim(), type, parentId);
    setName("");
    setType("room");
    setParentId(undefined);
  };

  const handleClose = () => {
    setName("");
    setType("room");
    setParentId(undefined);
    onClose();
  };

  const handleTypeChange = (newType: SpaceType) => {
    setType(newType);
    setParentId(undefined);
  };

  const requiresParent = validParentTypes[type].length > 0;
  const hasValidParents = parentOptions.length > 0;

  return (
    <Sheet open={open} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-[420px] bg-slate-800 border-slate-700 text-slate-100 p-0"
      >
        <SheetHeader className="p-6 border-b border-slate-700">
          <SheetTitle className="text-slate-100">Add New Space</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Space Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Space Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {spaceTypes.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors text-center",
                    type === value
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      type === value ? "text-cyan-400" : "text-slate-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      type === value ? "text-cyan-400" : "text-slate-300"
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-slate-400 leading-tight">
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label
              htmlFor="space-name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Name
            </label>
            <input
              id="space-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "building"
                  ? "e.g., Main Office"
                  : type === "floor"
                    ? "e.g., Ground Floor"
                    : "e.g., Conference Room A"
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Parent Selection (for floors, rooms, and areas) */}
          {requiresParent && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Parent Location
                <span className="text-slate-500 font-normal ml-1">
                  ({type === "floor" ? "Building" : "Building or Floor"})
                </span>
              </label>
              {hasValidParents ? (
                <Select value={parentId || ""} onValueChange={setParentId}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-100 focus:ring-cyan-500">
                    <SelectValue placeholder="Select parent location" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {parentOptions.map((zone) => (
                      <SelectItem
                        key={zone.id}
                        value={zone.id}
                        className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          {zone.type === "building" && (
                            <Building2 className="w-4 h-4 text-indigo-400" />
                          )}
                          {zone.type === "floor" && (
                            <Layers className="w-4 h-4 text-blue-400" />
                          )}
                          {zone.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <p className="text-sm text-slate-400">
                    {type === "floor"
                      ? "Create a building first to add floors."
                      : "Create a building or floor first to add rooms."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !name.trim() || (requiresParent && (!hasValidParents || !parentId))
              }
              className="px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-md transition-colors"
            >
              Create Space
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
});
