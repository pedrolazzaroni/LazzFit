import React, { useState } from 'react';
import DistanceInput from './common/DistanceInput';
import DurationInput from './common/DurationInput';

const ExemploFormulario = () => {
  // Estados para armazenar os valores
  const [distancia, setDistancia] = useState('');
  const [duracao, setDuracao] = useState('');
  
  // Função para lidar com o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Distância:', distancia, 'km');
    console.log('Duração:', duracao, 'segundos');
    
    // Aqui você pode fazer o processamento necessário com os valores
  };
  
  return (
    <div className="formulario-container">
      <h2>Cadastro de Atividade</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Distância percorrida:</label>
          {/* Substitua o input padrão por DistanceInput */}
          <DistanceInput 
            value={distancia}
            onChange={setDistancia}
            placeholder="Digite a distância (ex: 10.5)"
          />
        </div>
        
        <div className="form-group">
          <label>Tempo de duração:</label>
          {/* Substitua o input padrão por DurationInput */}
          <DurationInput
            value={duracao}
            onChange={setDuracao}
            placeholder="Digite a duração (ex: 55:24)"
          />
        </div>
        
        <button type="submit" className="btn-submit">
          Salvar Atividade
        </button>
      </form>
    </div>
  );
};

export default ExemploFormulario;
