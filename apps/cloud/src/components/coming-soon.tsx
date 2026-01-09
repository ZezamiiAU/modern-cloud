import type { LucideIcon } from "lucide-react";
import type { Card, CardContent } from "@repo/ui";

interface ComingSoonProps {
  productName: string;
  productIcon: LucideIcon;
  productColor: string;
  description: string;
  features?: string[];
}

export function ComingSoon({
  productName,
  productIcon: Icon,
  productColor,
  description,
  features = [],
}: ComingSoonProps) {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center ${productColor}`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {productName}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">{description}</p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold mb-8">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Coming Soon
          </div>

          {/* Features Preview */}
          {features.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                What&apos;s Coming
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-sm text-gray-500 mt-8">
            This module is currently under development. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
