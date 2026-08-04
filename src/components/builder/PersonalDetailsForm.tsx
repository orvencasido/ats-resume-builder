import React, { useState } from 'react';
import { PersonalInfo, ProfileImage } from '../../types';
import { User, Mail, Phone, Globe, ImagePlus, Trash2, MoveHorizontal, MoveVertical, ZoomIn } from 'lucide-react';

interface Props {
  data: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
  profileImage?: ProfileImage | null;
  onProfileImageChange?: (updated: ProfileImage | null) => void;
}

const createCroppedImage = (
  originalDataUrl: string,
  zoom: number,
  positionX: number,
  positionY: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = 480;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas is not supported in this browser.'));
        return;
      }

      canvas.width = size;
      canvas.height = size;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, size, size);

      const coverScale = Math.max(size / image.width, size / image.height);
      const scale = coverScale * (zoom / 100);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const drawX = (size - drawWidth) * (positionX / 100);
      const drawY = (size - drawHeight) * (positionY / 100);

      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    image.onerror = () => reject(new Error('Unable to load selected image.'));
    image.src = originalDataUrl;
  });
};

export const PersonalDetailsForm: React.FC<Props> = ({
  data,
  onChange,
  profileImage,
  onProfileImageChange,
}) => {
  const [imageError, setImageError] = useState<string | null>(null);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const updateProfileImage = async (updates: Partial<ProfileImage>) => {
    if (!profileImage || !onProfileImageChange) return;
    const next = {
      ...profileImage,
      ...updates,
    };
    try {
      const croppedDataUrl = await createCroppedImage(
        next.originalDataUrl,
        next.zoom,
        next.positionX,
        next.positionY
      );
      onProfileImageChange({
        ...next,
        croppedDataUrl,
      });
      setImageError(null);
    } catch (error: any) {
      setImageError(error?.message || 'Unable to crop selected image.');
    }
  };

  const handleImageUpload = (file?: File) => {
    if (!file || !onProfileImageChange) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const originalDataUrl = String(reader.result || '');
      try {
        const next = {
          originalDataUrl,
          croppedDataUrl: '',
          zoom: 115,
          positionX: 50,
          positionY: 50,
        };
        const croppedDataUrl = await createCroppedImage(
          next.originalDataUrl,
          next.zoom,
          next.positionX,
          next.positionY
        );
        onProfileImageChange({
          ...next,
          croppedDataUrl,
        });
        setImageError(null);
      } catch (error: any) {
        setImageError(error?.message || 'Unable to prepare selected image.');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={data.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g. ORVEN CASIDO"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. orvencasidop@gmail.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={data.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. +63 912 345 6789"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
          </div>
        </div>

        {/* Website / LinkedIn */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Website / LinkedIn / Portfolio
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={data.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="e.g. linkedin.com/in/orvencasido"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Profile Image</h3>
          </div>
          {profileImage?.originalDataUrl && onProfileImageChange && (
            <button
              type="button"
              onClick={() => onProfileImageChange(null)}
              className="inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
          <div>
            <div
              className="h-[120px] w-[120px] overflow-hidden border border-slate-300 bg-white shadow-sm"
              style={{
                backgroundImage: profileImage?.croppedDataUrl
                  ? `url(${profileImage.croppedDataUrl})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!profileImage?.croppedDataUrl && (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <label className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800">
              <ImagePlus className="mr-1.5 h-4 w-4" />
              Choose 1x1 Image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleImageUpload(event.target.files?.[0])}
                className="sr-only"
              />
            </label>

            {profileImage?.originalDataUrl && (
              <div className="grid grid-cols-1 gap-3">
                <label className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center">
                      <ZoomIn className="mr-1 h-3.5 w-3.5 text-indigo-600" />
                      Coverage / Zoom
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">{profileImage.zoom}%</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={220}
                    step={5}
                    value={profileImage.zoom}
                    onChange={(event) => updateProfileImage({ zoom: Number(event.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </label>

                <label className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center">
                      <MoveHorizontal className="mr-1 h-3.5 w-3.5 text-indigo-600" />
                      Horizontal Position
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">{profileImage.positionX}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={profileImage.positionX}
                    onChange={(event) => updateProfileImage({ positionX: Number(event.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </label>

                <label className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center">
                      <MoveVertical className="mr-1 h-3.5 w-3.5 text-indigo-600" />
                      Vertical Position
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">{profileImage.positionY}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={profileImage.positionY}
                    onChange={(event) => updateProfileImage({ positionY: Number(event.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </label>
              </div>
            )}

            {imageError && (
              <p className="text-xs font-medium text-rose-600">{imageError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
