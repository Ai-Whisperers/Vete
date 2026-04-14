import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DiagnosisCode {
  id: number;
  code: string;
  description: string;
}

const DiagnosisCodeLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [diagnosisCodes, setDiagnosisCodes] = useState<DiagnosisCode[]>([]);
  const [recentCodes, setRecentCodes] = useState<DiagnosisCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<DiagnosisCode | null>(null);

  useEffect(() => {
    const fetchRecentCodes = async () => {
      const { data, error } = await supabase
        .from('diagnosis_codes')
        .select('id, code, description')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error(error);
      } else {
        setRecentCodes(data);
      }
    };

    fetchRecentCodes();
  }, []);

  const handleSearch = async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('diagnosis_codes')
      .select('id, code, description')
      .textSearch('code', searchTerm);

    if (error) {
      console.error(error);
    } else {
      setDiagnosisCodes(data);
    }
  };

  const handleSelectCode = (code: DiagnosisCode) => {
    setSelectedCode(code);
  };

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search diagnosis codes"
      />
      <button onClick={() => handleSearch(searchTerm)}>Search</button>
      <ul>
        {diagnosisCodes.map((code) => (
          <li key={code.id}>
            <span>{code.code}</span>
            <span>{code.description}</span>
            <button onClick={() => handleSelectCode(code)}>Select</button>
          </li>
        ))}
      </ul>
      <h2>Recent codes</h2>
      <ul>
        {recentCodes.map((code) => (
          <li key={code.id}>
            <span>{code.code}</span>
            <span>{code.description}</span>
          </li>
        ))}
      </ul>
      {selectedCode && (
        <div>
          <h2>Selected code</h2>
          <p>{selectedCode.code}</p>
          <p>{selectedCode.description}</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosisCodeLookup;