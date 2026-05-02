import React from 'react';
import { Input } from 'antd';
import { Loader2, Send } from 'lucide-react';

export default function ChatInput({ inputText, setInputText, onSend, isSending }) {
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-100 flex items-end gap-2 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-10 relative">
      <Input.TextArea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Hỏi trợ lý AI về sản phẩm..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        className="flex-1 bg-gray-50 border border-gray-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-xl py-2.5 px-4 text-[14px] custom-scrollbar transition-all"
        disabled={isSending}
      />
      <button
        onClick={onSend}
        disabled={!inputText.trim() || isSending}
        className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 ${
          inputText.trim() && !isSending
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isSending ? <Loader2 size={20} className="animate-spin text-blue-600" /> : <Send size={20} className="ml-1" />}
      </button>
    </div>
  );
}