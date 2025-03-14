import React, { useState } from 'react';
import './InputStyles.css';

const DistanceInput = ({ value, onChange, className, placeholder = "Distância (km)", ...rest }) => {
  const [displayValue, setDisplayValue] = useState(value || '');

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Valida se o input é vazio ou um número com até 2 casas decimais
    if (inputValue === '' || /^\d*\.?\d{0,2}$/.test(inputValue)) {
      setDisplayValue(inputValue);
      
      // Converte para número e passa para o handler externo
      const numericValue = inputValue === '' ? '' : parseFloat(inputValue);
      onChange(numericValue);
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={`distance-input ${className || ''}`}
        placeholder={placeholder}
        {...rest}
      />
      <span className="input-suffix">km</span>
    </div>
  );
};

export default DistanceInput;
