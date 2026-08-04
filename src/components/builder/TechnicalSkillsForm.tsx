import React from 'react';
import { TechnicalSkillGroup } from '../../types';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  items: TechnicalSkillGroup[];
  onChange: (updated: TechnicalSkillGroup[]) => void;
}

export const TechnicalSkillsForm: React.FC<Props> = ({ items, onChange }) => {
  const handleAddItem = () => {
    const newItem: TechnicalSkillGroup = {
      id: crypto.randomUUID(),
      title: '',
      skills: '',
      sortOrder: items.length + 1,
    };
    onChange([...items, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDuplicateItem = (index: number) => {
    const original = items[index];
    const duplicated: TechnicalSkillGroup = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (Copy)`,
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  const handleUpdateItem = (index: number, field: keyof TechnicalSkillGroup, value: string) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 mb-2">
        Group your technical competencies into clear categories. Skills are rendered as bullet items with the bold category title followed by your comma-separated tools.
      </p>

      {items.map((item, index) => (
        <div
          key={item.id || index}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-semibold text-slate-800 text-sm">
              Category #{index + 1}: {item.title || 'New Category'}
            </span>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDuplicateItem(index)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(index)}
                className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                placeholder="e.g. Cloud & Infrastructure"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Skills (Comma Separated) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={item.skills}
                onChange={(e) => handleUpdateItem(index, 'skills', e.target.value)}
                placeholder="e.g. Kubernetes, Azure, AWS, Docker, Terraform, Linux"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddItem}
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl font-medium text-sm text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add Skill Category</span>
      </button>
    </div>
  );
};
