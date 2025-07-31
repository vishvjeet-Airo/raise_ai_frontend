import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function KeyDataAndTables() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Data and Tables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Table - Investment Limits for : FY 2025 - 26</h4>
            <p className="text-sm text-gray-600 mb-4">Table I from the circular showing revised limits across different periods.</p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Period</TableHead>
                    <TableHead className="text-center">G-SC General</TableHead>
                    <TableHead className="text-center">G-SC General</TableHead>
                    <TableHead className="text-center">G-SC General</TableHead>
                    <TableHead className="text-center">G-SC General</TableHead>
                    <TableHead className="text-center">G-SC General</TableHead>
                    <TableHead className="text-center">G-SC General</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Current Limits</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Apr-Sep 2025</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Apr 2024 - Sep 2025</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                    <TableCell className="text-center">23,55,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
