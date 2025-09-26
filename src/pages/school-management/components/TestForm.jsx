import React, { useState } from 'react';
import SimpleSelect from '../../../components/ui/SimpleSelect';
import SimpleButton from '../../../components/ui/SimpleButton';

const TestForm = ({ onSuccess }) => {
  const [schoolType, setSchoolType] = useState('');
  
  const schoolTypeOptions = [
    { value: 'primary', label: 'École Primaire' },
    { value: 'secondary', label: 'Établissement Secondaire' },
    { value: 'college', label: 'Collège' }
  ];

  return (
    <div className="space-y-4">
      <h3>Test Form - Minimal</h3>
      
      <SimpleSelect
        label="Type d'établissement"
        value={schoolType}
        onChange={setSchoolType}
        options={schoolTypeOptions}
        placeholder="Sélectionner un type..."
      />

      {schoolType && (
        <div>
          <p>Type sélectionné: {schoolType}</p>
          <div style={{ border: '1px solid #ddd', padding: '10px' }}>
            <h4>Classes disponibles:</h4>
            <div>
              <input type="checkbox" id="class1" />
              <label htmlFor="class1">Classe 1</label>
            </div>
            <div>
              <input type="checkbox" id="class2" />
              <label htmlFor="class2">Classe 2</label>
            </div>
          </div>
        </div>
      )}
      
      <SimpleButton onClick={() => onSuccess?.()}>
        Test Submit
      </SimpleButton>
    </div>
  );
};

export default TestForm;