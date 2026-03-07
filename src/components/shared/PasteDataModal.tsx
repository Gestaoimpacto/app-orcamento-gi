import React, { useState } from 'react';

interface PasteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: string) => void;
  title: string;
}

const PasteDataModal: React.FC<PasteDataModalProps> = ({ isOpen, onClose, onImport, title }) => {
  const [pastedText, setPastedText] = useState('');

  if (!isOpen) return null;

  const handleImportClick = () => {
    onImport(pastedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-brand-dark mb-4">{title}</h2>
        <div className="text-sm text-gray-700 space-y-2 mb-4">
          <p>Copie os dados de sua planilha (Excel, Google Sheets) e cole no campo abaixo. O formato esperado é:</p>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <ul className="list-disc list-inside space-y-1">
                <li>A primeira coluna deve conter o nome do indicador (ex: "Receita Bruta Total (R$)").</li>
                <li>As 12 colunas seguintes devem conter os valores para Janeiro a Dezembro.</li>
                <li>Colunas separadas por TAB (padrão ao copiar da planilha).</li>
            </ul>
             <p className="mt-2 font-semibold text-orange-600">Atenção: Apenas os indicadores financeiros padrão serão importados. Linhas personalizadas devem ser preenchidas manualmente.</p>
          </div>
        </div>
        <textarea
          className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-brand-orange focus:border-brand-orange"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Cole seus dados aqui..."
        />
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleImportClick} disabled={!pastedText} className="px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-md hover:opacity-80 disabled:bg-gray-400">
            Importar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasteDataModal;
