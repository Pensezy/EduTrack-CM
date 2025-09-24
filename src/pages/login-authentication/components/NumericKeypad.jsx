import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NumericKeypad = ({ onPinChange, pin, onSubmit, isLoading = false, className = '' }) => {
  const [pressedKey, setPressedKey] = useState(null);

  const keypadNumbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['clear', 0, 'backspace']
  ];

  const handleKeyPress = (key) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);

    if (key === 'clear') {
      onPinChange('');
    } else if (key === 'backspace') {
      onPinChange(pin?.slice(0, -1));
    } else if (typeof key === 'number' && pin?.length < 6) {
      onPinChange(pin + key?.toString());
    }
  };

  const handleSubmit = () => {
    if (pin?.length >= 6) {
      onSubmit();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* PIN Display */}
      <div className="text-center space-y-4">
        <h2 className="font-heading font-heading-semibold text-xl text-text-primary">
          Entrez votre code PIN
        </h2>
        <div className="flex justify-center space-x-3">
          {[...Array(6)]?.map((_, index) => {
            // Use a stable key based on the PIN value at this position
            const pinChar = pin?.[index] || '';
            return (
              <div
                key={`pin-dot-${index}-${pinChar}`}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-micro ${
                  index < pin?.length
                    ? 'border-primary bg-primary/10' :'border-border bg-input'
                }`}
              >
                {index < pin?.length && (
                  <div className="w-3 h-3 bg-primary rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        {keypadNumbers?.flat()?.map((key, idx) => {
          // Use a stable key for each button
          let buttonKey = typeof key === 'number' ? `num-${key}` : `action-${key}`;
          if (key === 'clear') {
            return (
              <Button
                key={buttonKey}
                variant="outline"
                size="lg"
                onClick={() => handleKeyPress(key)}
                className={`h-16 text-error hover:bg-error/10 transition-micro ${
                  pressedKey === key ? 'scale-95 bg-error/20' : ''
                }`}
                disabled={isLoading}
              >
                <Icon name="RotateCcw" size={20} />
              </Button>
            );
          }
          if (key === 'backspace') {
            return (
              <Button
                key={buttonKey}
                variant="outline"
                size="lg"
                onClick={() => handleKeyPress(key)}
                className={`h-16 hover:bg-muted transition-micro ${
                  pressedKey === key ? 'scale-95 bg-muted' : ''
                }`}
                disabled={isLoading || pin?.length === 0}
              >
                <Icon name="Delete" size={20} />
              </Button>
            );
          }
          return (
            <Button
              key={buttonKey}
              variant="outline"
              size="lg"
              onClick={() => handleKeyPress(key)}
              className={`h-16 font-heading font-heading-semibold text-xl hover:bg-primary/10 hover:border-primary transition-micro ${
                pressedKey === key ? 'scale-95 bg-primary/20 border-primary' : ''
              }`}
              disabled={isLoading}
            >
              {key}
            </Button>
          );
        })}
      </div>
      {/* Submit Button */}
      <div className="text-center">
        <Button
          variant="default"
          size="lg"
          onClick={handleSubmit}
          disabled={pin?.length < 6 || isLoading}
          loading={isLoading}
          className="w-full max-w-xs"
        >
          Se connecter
        </Button>
      </div>
    </div>
  );
};

export default NumericKeypad;