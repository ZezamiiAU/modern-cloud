import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

export default function AccessSpacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Access Spaces</h1>
        <p className="text-gray-600 mt-1">Configure access-controlled spaces</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            The Access Spaces module is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
