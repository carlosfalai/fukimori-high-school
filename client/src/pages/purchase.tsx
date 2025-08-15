import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ amount, pages, onSuccess }: { amount: number; pages: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/game",
      },
    });
    
    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: `Added ${pages} pages to your story!`,
      });
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="mt-4">
        <Button
          type="submit"
          className="w-full bg-primary-500 hover:bg-primary-600"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

type PackageOption = {
  id: string;
  pages: number;
  amount: number;
  label: string;
  description: string;
  isPopular?: boolean;
};

export default function Purchase() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  
  const packages: PackageOption[] = [
    {
      id: "basic",
      pages: 50,
      amount: 499,
      label: "50 Pages",
      description: "Continue your story"
    },
    {
      id: "standard",
      pages: 150,
      amount: 999,
      label: "150 Pages",
      description: "Extended gameplay",
      isPopular: true
    },
    {
      id: "premium",
      pages: 300,
      amount: 1499,
      label: "300 Pages",
      description: "Complete semester"
    }
  ];
  
  const createPaymentIntent = async (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    try {
      const response = await apiRequest("POST", "/api/payment/create-payment-intent", {
        amount: pkg.amount,
        pages: pkg.pages
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setSelectedPackage(pkg);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handlePackageSelect = (packageId: string) => {
    createPaymentIntent(packageId);
  };
  
  const handlePaymentSuccess = () => {
    setTimeout(() => {
      setLocation("/game");
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-neutral-dark flex flex-col">
      <header className="bg-neutral-dark border-b border-primary-500 p-4">
        <div className="container mx-auto">
          <div className="flex items-center">
            <button 
              onClick={() => setLocation("/game")} 
              className="text-neutral-light hover:text-white mr-4"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="text-lg font-heading font-bold text-white">Fukimori <span className="text-primary-500">High</span></h1>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Purchase Story Pages</h1>
            <p className="text-neutral-light">Expand your adventure at Fukimori High School</p>
          </div>
          
          {!clientSecret ? (
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className={`relative border ${pkg.isPopular ? 'border-primary-500' : 'border-gray-700'}`}>
                  {pkg.isPopular && (
                    <div className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
                      Best Value
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{pkg.label}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${(pkg.amount / 100).toFixed(2)}</div>
                    <div className="text-sm text-gray-400 mt-1">{(pkg.pages / pkg.amount * 100).toFixed(0)} pages per dollar</div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handlePackageSelect(pkg.id)}
                      className="w-full bg-primary-500 hover:bg-primary-600"
                    >
                      Select
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
                <CardDescription>Secure payment processed by Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPackage && (
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Package</span>
                      <span className="font-medium">{selectedPackage.label}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Pages</span>
                      <span className="font-medium">{selectedPackage.pages}</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${(selectedPackage.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    amount={selectedPackage?.amount || 0} 
                    pages={selectedPackage?.pages || 0}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="bg-neutral-dark border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Fukimori High Visual Novel</p>
        </div>
      </footer>
    </div>
  );
}
