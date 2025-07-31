import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIGeneratedSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Generated Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            The balance sheet of a monetary authority is unique in its importance, derived not only as the source of
            monetary creation but also as a description of the relationships with the government on the one hand and
            the banking and financial system on the other. Not surprisingly, the information content and health of
            central bank balance sheet is thus engaging attention the world over in an effort to unravel the
            mystique surrounding the temples of money. What is surprising is the fact that such an analysis has not
            been done comprehensively in the context of Reserve Bank of India.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
