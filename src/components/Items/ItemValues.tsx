import React from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatFullValue, formatPrice } from '@/utils/values';

interface ItemValuesProps {
  cashValue: string | null;
  dupedValue: string | null;
  demand: string;
  trend?: string | null;
  notes: string;
  price: string;
  health: number;
  type: string;
}

export default function ItemValues({
  cashValue,
  dupedValue,
  demand,
  trend,
  notes,
  price,
  health,
  type,
}: ItemValuesProps) {
  const isRobuxPrice = price.toLowerCase().includes('robux');
  const isUSDPrice = price.includes('$');
  const hasNoPrice = price === 'N/A';

  return (
    <div className="border-stroke bg-secondary-bg mb-8 space-y-6 rounded-xl border p-6">
      <div className="flex items-center gap-3">
        <div className="bg-button-info/20 flex h-8 w-8 items-center justify-center rounded-lg">
          <BanknotesIcon className="text-button-info h-5 w-5" />
        </div>
        <h3 className="text-primary-text text-xl font-semibold">Item Values</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Cash Value */}
        <div className="border-stroke rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-secondary-text text-sm font-medium">Cash Value</h4>
          </div>
          <p className="text-primary-text text-2xl font-bold">{formatFullValue(cashValue)}</p>
        </div>

        {/* Duped Value */}
        <div className="border-stroke rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-secondary-text text-sm font-medium">Duped Value</h4>
          </div>
          <p className="text-primary-text text-2xl font-bold">{formatFullValue(dupedValue)}</p>
        </div>

        {/* Original Price */}
        <div className="border-stroke rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-secondary-text text-sm font-medium">Original Price</h4>
          </div>
          <div className="flex items-center gap-2">
            {!hasNoPrice &&
              (isRobuxPrice ? (
                <Image
                  src="/assets/images/Robux_Icon.png"
                  alt="Robux"
                  width={20}
                  height={20}
                  className="h-6 w-6"
                />
              ) : (
                !isUSDPrice &&
                price.toLowerCase() !== 'free' && (
                  <BanknotesIcon className="text-primary-text h-6 w-6" />
                )
              ))}
            <p className="text-primary-text text-2xl font-bold">{formatPrice(price)}</p>
          </div>
        </div>

        {/* Vehicle Health - Only show for vehicles */}
        {type.toLowerCase() === 'vehicle' && (
          <div className="border-stroke rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <h4 className="text-secondary-text text-sm font-medium">Vehicle Health</h4>
            </div>
            <p className="text-primary-text text-2xl font-bold">{health || '???'}</p>
          </div>
        )}

        {/* Item Demand */}
        <div className="border-stroke rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-secondary-text text-sm font-medium">Item Demand</h4>
          </div>
          <p className="text-primary-text text-2xl font-bold">
            {demand === 'N/A' ? 'Unknown' : demand}
          </p>
        </div>

        {/* Item Trend */}
        <div className="border-stroke rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-secondary-text text-sm font-medium">Trend</h4>
          </div>
          <p className="text-primary-text text-2xl font-bold">
            {!trend || trend === 'Unknown' ? 'Unknown' : trend}
          </p>
        </div>
      </div>

      {/* Item Notes - Full width */}
      {notes && notes.trim() !== '' && (
        <div className="border-stroke rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-secondary-text text-sm font-medium">Item Notes</h4>
          </div>
          <p className="text-primary-text text-2xl font-bold">{notes}</p>
        </div>
      )}
    </div>
  );
}
