// QRCode Component
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const QRCode = ({ value, size = 128, className = '' }) => {
  return (
    <div className={`p-2 bg-white rounded border border-neutral-200 inline-flex items-center justify-center ${className}`}>
      {value ? (
        <QRCodeSVG 
          value={value} 
          size={size} 
          level="M" 
          includeMargin={false}
          className="max-w-full"
        />
      ) : (
        <span className="text-xs text-neutral-400">No data</span>
      )}
    </div>
  );
};

export default QRCode;
