"use client";

import { useState } from "react";
import { Card, Button } from "@repo/ui";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";

interface Pass {
  id: string;
  passId: string;
  userName: string;
  email: string;
  type: "Permanent" | "Temporary" | "Visitor";
  site: string;
  issuedDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Pending";
  accessLevel: string;
}

// Mock data
const mockPasses: Pass[] = [
  {
    id: "1",
    passId: "PASS-2024-001",
    userName: "John Doe",
    email: "john.doe@zezamii.com",
    type: "Permanent",
    site: "Melbourne CBD",
    issuedDate: "2024-01-15",
    expiryDate: "2025-01-15",
    status: "Active",
    accessLevel: "Full Access",
  },
  {
    id: "2",
    passId: "PASS-2024-002",
    userName: "Jane Smith",
    email: "jane.smith@zezamii.com",
    type: "Temporary",
    site: "Melbourne CBD",
    issuedDate: "2024-03-10",
    expiryDate: "2024-06-10",
    status: "Expired",
    accessLevel: "Limited Access",
  },
  {
    id: "3",
    passId: "PASS-2024-003",
    userName: "Bob Johnson",
    email: "bob.johnson@contractor.com",
    type: "Visitor",
    site: "Sydney Office",
    issuedDate: "2024-12-20",
    expiryDate: "2024-12-21",
    status: "Active",
    accessLevel: "Visitor",
  },
  {
    id: "4",
    passId: "PASS-2024-004",
    userName: "Alice Williams",
    email: "alice.w@guest.com",
    type: "Visitor",
    site: "Melbourne CBD",
    issuedDate: "2024-12-28",
    expiryDate: "2024-12-28",
    status: "Pending",
    accessLevel: "Visitor",
  },
  {
    id: "5",
    passId: "PASS-2024-005",
    userName: "Charlie Brown",
    email: "charlie.b@zezamii.com",
    type: "Permanent",
    site: "Brisbane HQ",
    issuedDate: "2024-02-01",
    expiryDate: "2025-02-01",
    status: "Active",
    accessLevel: "Full Access",
  },
];

export function PassesTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [passes] = useState(mockPasses);

  const getStatusIcon = (status: Pass["status"]) => {
    switch (status) {
      case "Active":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "Expired":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: Pass["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Expired":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getTypeClass = (type: Pass["type"]) => {
    switch (type) {
      case "Permanent":
        return "bg-purple-100 text-purple-700";
      case "Temporary":
        return "bg-blue-100 text-blue-700";
      case "Visitor":
        return "bg-cyan-100 text-cyan-700";
    }
  };

  const filteredPasses = passes.filter(
    (pass) =>
      pass.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.passId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search passes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  Pass ID
                </th>
                <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  Site
                </th>
                <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  Access Level
                </th>
                <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  Issued / Expiry
                </th>
                <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-600 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPasses.map((pass) => (
                <tr key={pass.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono text-gray-900">{pass.passId}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{pass.userName}</span>
                      <span className="text-xs text-gray-500">{pass.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(pass.type)}`}
                    >
                      {pass.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{pass.site}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{pass.accessLevel}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{pass.issuedDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <span>→</span>
                        <span>{pass.expiryDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pass.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(pass.status)}`}
                      >
                        {pass.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing <span className="font-medium">{filteredPasses.length}</span> of{" "}
          <span className="font-medium">{passes.length}</span> passes
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
