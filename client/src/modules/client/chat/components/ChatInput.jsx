import React from 'react';
import { Input } from 'antd';
import { Loader2, Send } from 'lucide-react';

export default function ChatInput({ inputText, setInputText, onSend, isSending }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isSending) {
        onSend();
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    
    const lineCount = (value.match(/\n/g) || []).length + 1;
    
    if (lineCount > 3) {
      return;
    }
    
    setInputText(value);
  };

  return (
    <div className="p-3 bg-white border-t border-gray-100 flex items-end gap-2.5 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-10 relative">
      <Input.TextArea
        value={inputText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Hỏi trợ lý AI về sản phẩm..."
        autoSize={{ minRows: 2, maxRows: 3 }}
        
        maxLength={200}   
        className="flex-1 bg-gray-50 border border-gray-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-xl py-3 px-4 text-[14px] custom-scrollbar transition-all"
        disabled={isSending}
      />
      <button
        onClick={onSend}
        disabled={isSending || !inputText.trim()}
        className={`w-13 h-13 shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isSending
            ? 'bg-blue-500 text-white cursor-wait opacity-80'
            : inputText.trim()
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isSending ? (
          <Loader2 size={22} className="animate-spin text-white" />
        ) : (
          <Send size={22} className="ml-1" />
        )}
      </button>
    </div>
  );
}