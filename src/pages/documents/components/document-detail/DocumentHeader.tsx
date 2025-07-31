import { Card, CardContent } from "@/components/ui/card";

export default function DocumentHeader() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '16px', lineHeight: '100%', letterSpacing: '0%', width: '512px', height: '24px' }}>
          <span style={{ color: '#5B5A5A' }}>Document : </span><span style={{ color: '#767575' }}>Master Circular - Guarantees and Co-acceptances</span>
        </h1>
        <p className="text-sm mb-4" style={{
          color: '#4B8B74',
          width: '374px',
          height: '18px',
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: '12px',
          lineHeight: '100%',
          letterSpacing: '0%',
        }}>
          14 May 2025 | Reserve Bank of India | Reserve Bank Of India
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-7 px-3 rounded flex items-center" style={{ background: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 400, fontStyle: 'normal', fontSize: '12px', lineHeight: '20px', letterSpacing: '0%', color: '#5B5A5A', border: '1px solid #E5E7EB' }}>
              AP DIR Circular No.1
            </div>
            <div className="h-7 px-3 rounded flex items-center" style={{ background: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 400, fontStyle: 'normal', fontSize: '12px', lineHeight: '20px', letterSpacing: '0%', color: '#5B5A5A', border: '1px solid #E5E7EB' }}>
              Reserve Bank of India
            </div>
            <div className="h-7 px-3 rounded flex items-center" style={{ background: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 400, fontStyle: 'normal', fontSize: '12px', lineHeight: '20px', letterSpacing: '0%', color: '#5B5A5A', border: '1px solid #E5E7EB' }}>
              April, 2025 📅
            </div>
            <div className="h-7 px-3 rounded flex items-center" style={{ background: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 400, fontStyle: 'normal', fontSize: '12px', lineHeight: '20px', letterSpacing: '0%', color: '#5B5A5A', border: '1px solid #E5E7EB' }}>
              Effective: April 3, 2025
            </div>
            <div className="h-7 px-3 rounded flex items-center" style={{ background: '#FFFFFF', fontFamily: 'Poppins', fontWeight: 400, fontStyle: 'normal', fontSize: '12px', lineHeight: '20px', letterSpacing: '0%', color: '#5B5A5A', border: '1px solid #E5E7EB' }}>
              💬 Chat
            </div>
          </div>
          <div 
            className="px-3 text-white rounded flex items-center justify-center"
            style={{ backgroundColor: '#06CEA8', width: '142px', height: '28px', fontFamily: 'Poppins', fontWeight: 600, fontSize: '12px', lineHeight: '20px', letterSpacing: '0%' }}
          >
            Parsed & Validated
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
