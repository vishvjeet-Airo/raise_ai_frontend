import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DepartmentalActionItems() {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-900">Departmental Actions Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-100">
              <TableRow>
                <TableHead className="font-medium text-blue-900">Action</TableHead>
                <TableHead className="font-medium text-blue-900">Due Date</TableHead>
                <TableHead className="font-medium text-blue-900">Priority</TableHead>
                <TableHead className="font-medium text-blue-900">Owner</TableHead>
                <TableHead className="font-medium text-blue-900">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Currents Limits</TableCell>
                <TableCell>April 15, 2028</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">High</Badge>
                </TableCell>
                <TableCell>Treasury Department</TableCell>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending Verification</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Apr - Sep 2025</TableCell>
                <TableCell>April 15, 2028</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">High</Badge>
                </TableCell>
                <TableCell>Clients Relation</TableCell>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending Verification</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Apr 2024 - Sep 2025</TableCell>
                <TableCell>April 15, 2028</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">High</Badge>
                </TableCell>
                <TableCell>Compliance</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Progress</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
