import React from 'react';
import { WorkExperienceItem } from '../../types';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, AlignLeft } from 'lucide-react';

interface Props {
  items: WorkExperienceItem[];
  onChange: (updated: WorkExperienceItem[]) => void;
}

export const WorkExperienceForm: React.FC<Props> = ({ items, onChange }) => {
  const handleAddItem = () => {
    const newItem: WorkExperienceItem = {
      id: crypto.randomUUID(),
      jobTitle: '',
      company: '',
      duration: '',
      descriptions: [''],
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
    const duplicated: WorkExperienceItem = {
      ...original,
      id: crypto.randomUUID(),
      jobTitle: `${original.jobTitle} (Copy)`,
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

  const handleUpdateItem = (index: number, field: keyof WorkExperienceItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleAddDescription = (expIndex: number) => {
    const updated = [...items];
    updated[expIndex].descriptions.push('');
    onChange(updated);
  };

  const handleUpdateDescription = (expIndex: number, descIndex: number, value: string) => {
    const updated = [...items];
    updated[expIndex].descriptions[descIndex] = value;
    onChange(updated);
  };

  const handleDeleteDescription = (expIndex: number, descIndex: number) => {
    const updated = [...items];
    updated[expIndex].descriptions.splice(descIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4"
        >
          {/* Header & Controls */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="font-semibold text-slate-800 text-sm flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <span>{item.jobTitle || 'New Work Experience'}</span>
            </div>

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

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={item.jobTitle}
                onChange={(e) => handleUpdateItem(index, 'jobTitle', e.target.value)}
                placeholder="e.g. Senior DevOps Engineer"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration / Dates <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={item.duration}
                onChange={(e) => handleUpdateItem(index, 'duration', e.target.value)}
                placeholder="e.g. January 2024 - Present"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={item.company}
                onChange={(e) => handleUpdateItem(index, 'company', e.target.value)}
                placeholder="e.g. TechSolutions Inc."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              />
            </div>
          </div>

          {/* Bullet Descriptions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Key Accomplishments & Bullet Points
              </label>
              <button
                type="button"
                onClick={() => handleAddDescription(index)}
                className="inline-flex items-center text-xs font-medium text-slate-700 hover:text-black hover:bg-slate-100 px-2 py-1 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Bullet
              </button>
            </div>

            <div className="space-y-2">
              {item.descriptions.map((desc, dIdx) => (
                <div key={dIdx} className="flex items-start space-x-2">
                  <span className="mt-2 text-slate-400 text-xs font-bold">•</span>
                  <textarea
                    rows={2}
                    value={desc}
                    onChange={(e) => handleUpdateDescription(index, dIdx, e.target.value)}
                    placeholder="Describe a key achievement, action verb + result (e.g. Reduced deployment times by 50%...)"
                    className="flex-1 p-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors leading-relaxed"
                  />
                  {item.descriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDescription(index, dIdx)}
                      className="mt-2 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                      title="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
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
        <span>Add Work Experience Entry</span>
      </button>
    </div>
  );
};
