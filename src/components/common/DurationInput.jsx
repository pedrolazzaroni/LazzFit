import React, { useState, useEffect } from 'react';
import './InputStyles.css';

const DurationInput = ({ value, onChange, className, placeholder = "Duração (MM:SS)", ...rest }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Formata o valor inicial ou quando ele muda externamente
  useEffect(() => {
    if (value) {
      const totalSeconds = typeof value === 'number' ? value : 0;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setDisplayValue(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Permite apenas dígitos e ":" no formato correto
    if (inputValue === '' || /^[0-9]{0,2}(:[0-9]{0,2})?$/.test(inputValue)) {
      setDisplayValue(inputValue);
      
      // Converte para segundos totais e passa para o handler externo
      if (inputValue.includes(':')) {
        const [minutes, seconds] = inputValue.split(':').map(part => parseInt(part) || 0);
        const totalSeconds = (minutes * 60) + seconds;
        onChange(totalSeconds);
      } else if (inputValue) {
        // Se só digitou minutos sem os dois pontos
        const minutes = parseInt(inputValue) || 0;
        onChange(minutes * 60);
      } else {
        onChange('');
      }
    }
  };

  // Formato final quando o input perde o foco
  const handleBlur = () => {
    if (displayValue) {
      let minutes = 0;
      let seconds = 0;
      
      if (displayValue.includes(':')) {
        [minutes, seconds] = displayValue.split(':').map(part => parseInt(part) || 0);
      } else {
        minutes = parseInt(displayValue) || 0;
      }
      
      // Formatação completa no formato MM:SS
      setDisplayValue(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`duration-input ${className || ''}`}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
};

export default DurationInput;
