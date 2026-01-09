import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-600 mt-1">View and manage system alerts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            The Alerts module is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
