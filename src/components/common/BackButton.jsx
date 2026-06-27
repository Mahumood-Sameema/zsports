// BackButton Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from './Button';

export const BackButton = ({ label = 'Back', onClick = null, className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      leftIcon={<ArrowLeft size={16} />}
      onClick={handleBack}
      className={`!text-neutral-500 hover:!text-neutral-800 hover:!bg-neutral-100 !px-2.5 !py-1.5 ${className}`}
    >
      {label}
    </Button>
  );
};

export default BackButton;
