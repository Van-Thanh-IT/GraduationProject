// File: src/modules/admin/chat/components/ChatInput.jsx
import React, { useState } from "react";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";

export const ChatInput = ({ onSendMessage, isUploading }) => {
    const [messageInput, setMessageInput] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 4) {
            alert("Chỉ được gửi tối đa 4 ảnh cùng lúc!");
            return;
        }
        setSelectedImages((prev) => [...prev, ...files].slice(0, 4));
        e.target.value = null;
    };

    const removeImage = (indexToRemove) => {
        setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (isUploading || (!messageInput.trim() && selectedImages.length === 0)) return;
        
        const success = await onSendMessage(messageInput, selectedImages);
        if (success) {
            setMessageInput("");
            setSelectedImages([]);
        }
    };

    return (
        <div className="bg-white border-t border-slate-200 p-3 shrink-0">
            {/* Preview Ảnh */}
            {selectedImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {selectedImages.map((file, idx) => (
                        <div key={idx} className="relative group">
                            <img src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-sm" />
                            <button
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Thanh Input */}
            <div className="flex items-end gap-2">
                <label className={`flex items-center justify-center p-3 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ImagePlus className="w-6 h-6" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
                </label>

                <textarea
                    rows={1}
                    className="flex-1 bg-slate-100 text-slate-800 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all resize-none max-h-24 custom-scrollbar text-sm font-medium"
                    placeholder="Nhập phản hồi..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    disabled={isUploading}
                />

                <button
                    onClick={handleSubmit}
                    disabled={isUploading || (!messageInput.trim() && selectedImages.length === 0)}
                    className="p-3.5 rounded-full flex items-center justify-center transition-all disabled:bg-slate-100 disabled:text-slate-400 bg-blue-600 text-white hover:bg-blue-700 shadow-md disabled:shadow-none"
                >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
            </div>
        </div>
    );
};