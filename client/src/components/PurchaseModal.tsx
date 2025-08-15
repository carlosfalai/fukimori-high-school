import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PurchaseOption {
  id: string;
  pages: number;
  price: number;
  title: string;
  description: string;
  isPopular?: boolean;
}

interface PurchaseModalProps {
  onClose: () => void;
}

export default function PurchaseModal({ onClose }: PurchaseModalProps) {
  const [, setLocation] = useLocation();
  
  const purchaseOptions: PurchaseOption[] = [
    {
      id: "small",
      pages: 50,
      price: 4.99,
      title: "50 Pages",
      description: "Continue your story"
    },
    {
      id: "medium",
      pages: 150,
      price: 9.99,
      title: "150 Pages",
      description: "Extended gameplay",
      isPopular: true
    },
    {
      id: "large",
      pages: 300,
      price: 14.99,
      title: "300 Pages",
      description: "Complete semester"
    }
  ];
  
  const handleCheckout = () => {
    setLocation("/purchase");
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center">
      <div className="bg-neutral-dark border border-primary-500 rounded-xl w-full max-w-md overflow-hidden">
        <div className="p-4 bg-primary-600 flex justify-between items-center">
          <h2 className="text-white font-heading font-bold text-xl">Purchase More Pages</h2>
          <button className="text-white hover:text-gray-300" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            You've used all your available pages. Purchase more to continue your adventure at Fukimori High School!
          </p>
          
          <div className="space-y-4 mb-6">
            {purchaseOptions.map((option) => (
              <div 
                key={option.id}
                className={`bg-gray-800 p-4 rounded-lg border ${option.isPopular ? 'border-primary-500' : 'border-gray-700 hover:border-primary-500'} cursor-pointer transition flex justify-between items-center relative`}
              >
                {option.isPopular && (
                  <div className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-white">{option.title}</h3>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                </div>
                <p className="text-white font-bold">${option.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button
              onClick={handleCheckout}
              className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 font-bold"
            >
              Proceed to Checkout
            </Button>
            <p className="text-gray-500 text-xs mt-3">Secure payment processed by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
