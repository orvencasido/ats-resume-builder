import React from 'react';
import { SectionKey, PageSize, PageMargins, ResumeLayout, SectionSpacingMap } from '../../types';
import { Modal } from '../ui/Modal';
import { ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Plus, Minus, MoveHorizontal, MoveVertical, Type, AlignJustify, Space } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  pageSize: PageSize;
  layout?: ResumeLayout;
  pageMargins?: PageMargins;
  fontSize?: number;
  lineHeight?: number;
  sectionSpacing?: SectionSpacingMap;
  onUpdateOrder: (newOrder: SectionKey[]) => void;
  onToggleHide: (key: SectionKey) => void;
  onUpdatePageSize: (size: PageSize) => void;
  onUpdateLayout: (layout: ResumeLayout) => void;
  onUpdatePageMargins: (margins: PageMargins) => void;
  onUpdateFontSize: (fontSize: number) => void;
  onUpdateLineHeight: (lineHeight: number) => void;
  onUpdateSectionSpacing?: (spacing: SectionSpacingMap) => void;
}

const DEFAULT_MARGINS: PageMargins = { top: 36, bottom: 36, left: 42, right: 42 };
const DEFAULT_FONT_SIZE = 9.8;
const DEFAULT_LINE_HEIGHT = 1.35;

const FONT_SIZE_PRESETS = [
  { name: 'Small', label: '8.8 pt', value: 8.8 },
  { name: 'Standard', label: '9.8 pt', value: 9.8 },
  { name: 'Large', label: '10.8 pt', value: 10.8 },
];

const LINE_HEIGHT_PRESETS = [
  { name: 'Compact', label: '1.20', value: 1.20 },
  { name: 'Standard', label: '1.35', value: 1.35 },
  { name: 'Relaxed', label: '1.50', value: 1.50 },
];

const MARGIN_PRESETS = [
  { name: 'Compact', label: '0.33 in / 24 pt', margins: { top: 24, bottom: 24, left: 28, right: 28 } },
  { name: 'Standard', label: '0.50 in / 36-42 pt', margins: { top: 36, bottom: 36, left: 42, right: 42 } },
  { name: 'Spacious', label: '0.75 in / 54 pt', margins: { top: 54, bottom: 54, left: 54, right: 54 } },
];

const SECTION_LABELS: Record<SectionKey, string> = {
  workExperience: 'Work Experience',
  technicalSkills: 'Technical Skills',
  education: 'Education',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards',
};

const DEFAULT_ORDER: SectionKey[] = [
  'workExperience',
  'technicalSkills',
  'education',
  'projects',
  'certifications',
  'awards',
];

export const SectionOrderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sectionOrder,
  hiddenSections,
  pageSize,
  layout = 'classic',
  pageMargins = DEFAULT_MARGINS,
  fontSize = DEFAULT_FONT_SIZE,
  lineHeight = DEFAULT_LINE_HEIGHT,
  sectionSpacing = {},
  onUpdateOrder,
  onToggleHide,
  onUpdatePageSize,
  onUpdateLayout,
  onUpdatePageMargins,
  onUpdateFontSize,
  onUpdateLineHeight,
  onUpdateSectionSpacing,
}) => {
  const currentMargins = pageMargins || DEFAULT_MARGINS;
  const currentFontSize = fontSize || DEFAULT_FONT_SIZE;
  const currentLineHeight = lineHeight || DEFAULT_LINE_HEIGHT;

  const handleSectionSpacingChange = (key: SectionKey, value: number) => {
    if (!onUpdateSectionSpacing) return;
    const clamped = isNaN(value) ? 12 : Math.min(Math.max(Math.round(value), 0), 60);
    onUpdateSectionSpacing({
      ...sectionSpacing,
      [key]: clamped,
    });
  };

  const handleApplyGlobalSpacing = (val: number) => {
    if (!onUpdateSectionSpacing) return;
    const clamped = isNaN(val) ? 12 : Math.min(Math.max(Math.round(val), 0), 60);
    const newSpacing: SectionSpacingMap = {};
    DEFAULT_ORDER.forEach((key) => {
      newSpacing[key] = clamped;
    });
    onUpdateSectionSpacing(newSpacing);
  };

  const handleResetSectionSpacing = () => {
    if (!onUpdateSectionSpacing) return;
    onUpdateSectionSpacing({});
  };

  const handleFontSizeChange = (val: number) => {
    const clamped = Math.min(Math.max(Number(val.toFixed(1)), 8.0), 12.0);
    onUpdateFontSize(clamped);
  };

  const handleLineHeightChange = (val: number) => {
    const clamped = Math.min(Math.max(Number(val.toFixed(2)), 1.10), 1.80);
    onUpdateLineHeight(clamped);
  };

  const handleMarginChange = (side: keyof PageMargins, value: number) => {
    const clamped = Math.min(Math.max(value, 12), 72);
    onUpdatePageMargins({
      ...currentMargins,
      [side]: clamped,
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sectionOrder.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sectionOrder];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateOrder(updated);
  };

  const handleResetOrder = () => {
    onUpdateOrder(DEFAULT_ORDER);
  };

  const handleResetMargins = () => {
    onUpdatePageMargins(DEFAULT_MARGINS);
  };

  const formatMarginSub = (pt: number) => {
    const inches = (pt / 72).toFixed(2);
    return `${pt} pt (${inches} in)`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resume Layout & Margin Settings" maxWidth="3xl">
      <div className="space-y-6 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1 pb-8">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Resume Header Layout
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onUpdateLayout('classic')}
              className={`rounded-xl border p-3 text-left transition-all ${
                layout === 'classic'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-semibold">Classic ATS</div>
              <div className="mt-0.5 text-xs opacity-75">Centered name and contact line, no profile image.</div>
            </button>

            <button
              type="button"
              onClick={() => onUpdateLayout('photo')}
              className={`rounded-xl border p-3 text-left transition-all ${
                layout === 'photo'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-semibold">Photo Header</div>
              <div className="mt-0.5 text-xs opacity-75">Contact details on the left with a 1x1 image on the upper right.</div>
            </button>
          </div>
        </div>

        {/* Page Format Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Document Paper Size
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onUpdatePageSize('A4')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                pageSize === 'A4'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="font-semibold text-sm">A4 Standard</div>
                <div className="text-xs opacity-75">210 × 297 mm</div>
              </div>
              {pageSize === 'A4' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => onUpdatePageSize('LETTER')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                pageSize === 'LETTER'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="font-semibold text-sm">US Letter</div>
                <div className="text-xs opacity-75">8.5 × 11 in</div>
              </div>
              {pageSize === 'LETTER' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Page Margins Settings */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Document Page Margins
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetMargins}
                className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-black hover:bg-slate-200/60 px-2 py-1 rounded transition-colors"
                title="Reset Margins to Default"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {MARGIN_PRESETS.map((preset) => {
              const isSelected =
                currentMargins.top === preset.margins.top &&
                currentMargins.bottom === preset.margins.bottom &&
                currentMargins.left === preset.margins.left &&
                currentMargins.right === preset.margins.right;

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onUpdatePageMargins(preset.margins)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100/70 font-medium'
                  }`}
                >
                  <div className="text-xs">{preset.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{preset.label}</div>
                </button>
              );
            })}
          </div>

          {/* Individual Margin Adjusters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Top Margin */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  <MoveVertical className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Top Margin</span>
                </span>
                <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formatMarginSub(currentMargins.top)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleMarginChange('top', currentMargins.top - 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Decrease Top Margin"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={12}
                  max={72}
                  step={2}
                  value={currentMargins.top}
                  onChange={(e) => handleMarginChange('top', Number(e.target.value))}
                  className="flex-1 min-w-0 w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleMarginChange('top', currentMargins.top + 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Increase Top Margin"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Margin */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  <MoveVertical className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bottom Margin</span>
                </span>
                <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formatMarginSub(currentMargins.bottom)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleMarginChange('bottom', currentMargins.bottom - 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Decrease Bottom Margin"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={12}
                  max={72}
                  step={2}
                  value={currentMargins.bottom}
                  onChange={(e) => handleMarginChange('bottom', Number(e.target.value))}
                  className="flex-1 min-w-0 w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleMarginChange('bottom', currentMargins.bottom + 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Increase Bottom Margin"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Left Margin */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  <MoveHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Left Margin</span>
                </span>
                <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formatMarginSub(currentMargins.left)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleMarginChange('left', currentMargins.left - 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Decrease Left Margin"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={12}
                  max={72}
                  step={2}
                  value={currentMargins.left}
                  onChange={(e) => handleMarginChange('left', Number(e.target.value))}
                  className="flex-1 min-w-0 w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleMarginChange('left', currentMargins.left + 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Increase Left Margin"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Margin */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  <MoveHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Right Margin</span>
                </span>
                <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formatMarginSub(currentMargins.right)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleMarginChange('right', currentMargins.right - 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Decrease Right Margin"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={12}
                  max={72}
                  step={2}
                  value={currentMargins.right}
                  onChange={(e) => handleMarginChange('right', Number(e.target.value))}
                  className="flex-1 min-w-0 w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleMarginChange('right', currentMargins.right + 2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Increase Right Margin"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Font Size & Line Height Settings */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Typography & Line Height Spacing
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateFontSize(DEFAULT_FONT_SIZE);
                onUpdateLineHeight(DEFAULT_LINE_HEIGHT);
              }}
              className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-black hover:bg-slate-200/60 px-2 py-1 rounded transition-colors"
              title="Reset Font Size & Line Height to Default"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Font Size Control */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  <Type className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Font Size</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {currentFontSize.toFixed(1)} pt
                </span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-1.5 pb-1">
                {FONT_SIZE_PRESETS.map((p) => {
                  const isSelected = Math.abs(currentFontSize - p.value) < 0.05;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleFontSizeChange(p.value)}
                      className={`py-1 px-1.5 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[10px] font-medium">{p.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">{p.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(currentFontSize - 0.2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Make Font Smaller"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={8.0}
                  max={12.0}
                  step={0.2}
                  value={currentFontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="flex-1 min-w-0 w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(currentFontSize + 0.2)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Make Font Bigger"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Line Height Control */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  <AlignJustify className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Line Height Spacing</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {currentLineHeight.toFixed(2)}
                </span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-1.5 pb-1">
                {LINE_HEIGHT_PRESETS.map((p) => {
                  const isSelected = Math.abs(currentLineHeight - p.value) < 0.02;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleLineHeightChange(p.value)}
                      className={`py-1 px-1.5 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[10px] font-medium">{p.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">{p.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleLineHeightChange(currentLineHeight - 0.05)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Decrease Line Height"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={1.10}
                  max={1.80}
                  step={0.05}
                  value={currentLineHeight}
                  onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                  className="flex-1 min-w-0 w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleLineHeightChange(currentLineHeight + 0.05)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Increase Line Height"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Ordering & Spacing */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Section Order & Spacing
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Adjust section positions and customize the height spacing in between them.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleResetSectionSpacing}
                className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-black hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                title="Reset Spacing to Default (12pt)"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Spacing
              </button>
              <button
                type="button"
                onClick={handleResetOrder}
                className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-black hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                title="Reset Section Order"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Order
              </button>
            </div>
          </div>

          {/* Quick Spacing Presets & Custom All-Section Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                <Space className="w-3.5 h-3.5 text-indigo-600" />
                <span>Apply To All Sections:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: 'Tight', pt: 8 },
                  { label: 'Normal', pt: 12 },
                  { label: 'Relaxed', pt: 16 },
                  { label: 'Spacious', pt: 20 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyGlobalSpacing(preset.pt)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg shadow-2xs transition-colors"
                  >
                    {preset.label} ({preset.pt}pt)
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Global Number Input */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Custom value for all sections:</span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min={0}
                  max={60}
                  step={1}
                  placeholder="e.g. 15"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = Number((e.target as HTMLInputElement).value);
                      if (!isNaN(val)) handleApplyGlobalSpacing(val);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value !== '') {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) handleApplyGlobalSpacing(val);
                    }
                  }}
                  className="w-16 px-2 py-1 text-xs font-mono font-bold text-center bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-slate-500 text-xs">pt</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {sectionOrder.map((key, index) => {
              const isHidden = hiddenSections.includes(key);
              const currentSpacing = sectionSpacing[key] ?? 12;

              return (
                <div
                  key={key}
                  className={`p-3 rounded-xl border transition-all ${
                    isHidden
                      ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm">{SECTION_LABELS[key]}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onToggleHide(key)}
                        className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${
                          isHidden ? 'text-rose-500 hover:text-rose-700' : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title={isHidden ? 'Show Section' : 'Hide Section'}
                      >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                        disabled={index === sectionOrder.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section Height Spacing: Stepper + Custom Editable Number Input */}
                  {!isHidden && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center space-x-1">
                        <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
                        <span>Spacing above section:</span>
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleSectionSpacingChange(key, currentSpacing - 1)}
                          disabled={currentSpacing <= 0}
                          className="p-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded transition-colors"
                          title="Decrease spacing"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <div className="relative inline-flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={60}
                            step={1}
                            value={currentSpacing}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              handleSectionSpacingChange(key, val);
                            }}
                            className="w-14 pl-2 pr-1 py-0.5 text-center font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="ml-1 text-[10px] text-slate-400 font-medium">pt</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSectionSpacingChange(key, currentSpacing + 1)}
                          disabled={currentSpacing >= 60}
                          className="p-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded transition-colors"
                          title="Increase spacing"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Modal>
  );
};
