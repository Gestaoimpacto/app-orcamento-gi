
import React, { useState, useCallback } from 'react';
import { editImageWithText } from '../services/geminiService';
import type { ImageEditResult } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // remove data:image/...;base64,
        };
        reader.onerror = (error) => reject(error);
    });
};


const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ImageEditResult | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        if (!prompt || !selectedFile) {
            setError('Por favor, selecione uma imagem e insira um prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image = await fileToBase64(selectedFile);
            const editedImageBase64 = await editImageWithText(base64Image, selectedFile.type, prompt);

            setResult({
                original: `data:${selectedFile.type};base64,${base64Image}`,
                edited: `data:image/png;base64,${editedImageBase64}`,
            });

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao editar a imagem.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, selectedFile]);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">Gemini Image Editor</h1>
                <p className="text-lg text-gray-600 mt-2">Edite imagens usando prompts de texto com o poder do Gemini 2.5 Flash Image.</p>
            </header>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                           1. Carregar Imagem
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-orange hover:text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-orange">
                                        <span>Selecione um arquivo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">ou arraste e solte</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                            </div>
                        </div>
                         {selectedFile && <p className="text-sm text-gray-600 mt-2">Arquivo selecionado: <span className="font-semibold">{selectedFile.name}</span></p>}
                    </div>

                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                            2. Descreva a Edição
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="prompt"
                                id="prompt"
                                className="shadow-sm focus:ring-brand-orange focus:border-brand-orange block w-full sm:text-sm border-gray-300 rounded-md p-3 bg-white text-gray-900"
                                placeholder='Ex: "Adicione um filtro retrô" ou "Remova a pessoa no fundo"'
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !selectedFile || !prompt}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Gerando...
                                </>
                            ): 'Gerar Imagem Editada'}
                        </button>
                    </div>
                </form>

                 {error && (
                    <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                        <p className="font-bold">Erro</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-brand-blue mb-6">Resultados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Original</h3>
                            <img src={result.original} alt="Original" className="rounded-lg w-full h-auto object-contain border" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Editada</h3>
                            <img src={result.edited} alt="Edited" className="rounded-lg w-full h-auto object-contain border" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageEditor;
