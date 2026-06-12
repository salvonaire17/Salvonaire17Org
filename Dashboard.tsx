import React, { useState } from 'react';

interface DeleteAccountProps {
  onConfirmDelete: () => Promise<void>;
}

export const DeleteAccountSection: React.FC<DeleteAccountProps> = ({ onConfirmDelete }) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      setIsDeleting(false);
      setIsConfirming(false);
    } catch (error) {
      console.error("Deletion failed:", error);
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="p-4 md:p-5 rounded-[2rem] bg-white border border-red-50 max-w-sm mx-auto text-center mt-2">
      {!isConfirming ? (
        // Initial State: Simple, clean trigger button
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">Danger Zone</h3>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Permanently remove your account and all associated data from the system.
          </p>
          <button
            onClick={() => setIsConfirming(true)}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 duration-200"
          >
            Delete Account
          </button>
        </div>
      ) : (
        // Confirmation State: Quick "Are you sure?" inline prompt
        <div className="animate-fade-in">
          <p className="text-xs font-bold text-red-600 mb-3">
            Are you absolutely sure? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm transition-all active:scale-95 duration-200 disabled:opacity-50"
            >
              {isDeleting ? "Erasing..." : "Yes, Delete"}
            </button>
            <button
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
