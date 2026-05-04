import React, { useState, useRef } from 'react';
import { addContent } from '../services/storageService';
import { saveAudio } from '../services/dbService';
import { AudioContent, ContentType } from '../types';

declare const jsmediatags: any;

interface UploadModalProps {
  onClose: () => void;
}

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-gray-100 mb-1">{label}</label>
        <input type="text" id={id} {...props} className="w-full bg-brand-gray-400 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-green" />
    </div>
);

const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ContentType>(ContentType.Audiobook);
    const [coverArt, setCoverArt] = useState<string>('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const coverArtInputRef = useRef<HTMLInputElement>(null);

    const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setTitle(file.name.replace(/\.[^/.]+$/, "")); // Set title from filename initially

            jsmediatags.read(file, {
                onSuccess: (tag: any) => {
                    if (tag.tags.title) setTitle(tag.tags.title);
                    if (tag.tags.artist) setAuthor(tag.tags.artist);
                    if (tag.tags.comment) setDescription(tag.tags.comment.text);
                    if (tag.tags.picture) {
                        const { data, format } = tag.tags.picture;
                        let base64String = "";
                        for (let i = 0; i < data.length; i++) {
                            base64String += String.fromCharCode(data[i]);
                        }
                        setCoverArt(`data:${format};base64,${window.btoa(base64String)}`);
                    }
                },
                onError: (error: any) => {
                    console.warn('Could not read metadata from audio file', error);
                }
            });
        }
    };

    const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverArt(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioFile || !title || !author) {
            setError('Por favor, completa los campos requeridos: archivo de audio, título y autor.');
            return;
        }
        setIsSaving(true);
        setError('');

        try {
            const id = `local-${Date.now()}`;
            const duration = await getAudioDuration(audioFile);

            const newContent: AudioContent = {
                id,
                title,
                author,
                description,
                type,
                coverArt: coverArt || 'https://picsum.photos/seed/placeholder/400/400',
                duration,
                genre: ['Subido por usuario'],
            };

            await saveAudio(id, audioFile);
            addContent(newContent);
            
            window.dispatchEvent(new Event('storageUpdated'));
            onClose();

        } catch (err) {
            console.error("Error al guardar el contenido:", err);
            setError('No se pudo guardar el archivo. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const getAudioDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const audio = document.createElement('audio');
            audio.preload = 'metadata';
            audio.onloadedmetadata = () => {
                window.URL.revokeObjectURL(audio.src);
                resolve(audio.duration);
            };
            audio.src = window.URL.createObjectURL(file);
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-gray-500 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-6">Añadir Nuevo Contenido</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="audioFile" className="block text-sm font-medium text-brand-gray-100 mb-1">Archivo de Audio (requerido)</label>
                        <input type="file" id="audioFile" accept="audio/*" onChange={handleAudioFileChange} required className="w-full text-sm text-brand-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gray-100 file:text-brand-black hover:file:bg-white" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <img src={coverArt || 'https://picsum.photos/seed/placeholder/100/100'} alt="Vista previa de portada" className="w-24 h-24 rounded-md object-cover bg-brand-gray-600"/>
                        <div>
                            <label htmlFor="coverArt" className="block text-sm font-medium text-brand-gray-100 mb-1">Portada</label>
                            <button type="button" onClick={() => coverArtInputRef.current?.click()} className="bg-brand-gray-400 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-brand-gray-300">
                                Subir Imagen
                            </button>
                            <input type="file" id="coverArt" ref={coverArtInputRef} accept="image/*" onChange={handleCoverArtChange} className="hidden" />
                        </div>
                    </div>

                    <InputField label="Título (requerido)" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <InputField label="Autor / Anfitrión (requerido)" id="author" value={author} onChange={e => setAuthor(e.target.value)} required />
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-gray-100 mb-1">Descripción</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-brand-gray-400 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-green"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-gray-100 mb-2">Tipo de Contenido</label>
                        <div className="flex gap-4">
                           <label className="flex items-center gap-2 cursor-pointer">
                               <input type="radio" name="type" value={ContentType.Audiobook} checked={type === ContentType.Audiobook} onChange={() => setType(ContentType.Audiobook)} className="form-radio bg-brand-gray-400 text-brand-green focus:ring-brand-green"/>
                               Audiolibro
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                               <input type="radio" name="type" value={ContentType.Podcast} checked={type === ContentType.Podcast} onChange={() => setType(ContentType.Podcast)} className="form-radio bg-brand-gray-400 text-brand-green focus:ring-brand-green"/>
                               Podcast
                           </label>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="bg-brand-gray-400 text-white font-bold py-2 px-6 rounded-full hover:bg-brand-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-brand-green text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;